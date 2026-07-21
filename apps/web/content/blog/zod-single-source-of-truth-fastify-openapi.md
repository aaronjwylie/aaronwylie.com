Most API bugs I've chased came from three descriptions of the same thing drifting apart: the validation rules, the response shape, and the documentation. You update the code, forget the docs, and now your OpenAPI spec is lying to whoever reads it. The fix is to make one schema do all three jobs.

## The idea

Define each endpoint's input and output once, with [Zod](https://zod.dev), and let that single schema:

1. **Validate** incoming requests (reject bad input at the edge).
2. **Serialize** outgoing responses (strip fields that shouldn't leak).
3. **Generate** the OpenAPI docs automatically.

Because the docs are *derived* from the schema, they can never drift from the code.

## Wiring it up in Fastify

Fastify lets you swap in a validator and serializer compiler. With `fastify-type-provider-zod`, your route `schema` blocks accept Zod objects directly:

    import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

Now a route describes itself completely:

    app.post('/projects', {
      schema: {
        body: z.object({ title: z.string().min(1), tags: z.array(z.string()) }),
        response: { 201: z.object({ id: z.number() }) },
      },
    }, async (req) => {
      // req.body is fully typed - no casting, no `any`
      const id = await createProject(req.body);
      return reply.code(201).send({ id });
    });

Three things happen for free here. The body is validated (a missing `title` returns a 400 before your handler runs). The response is serialized against its schema (extra fields are dropped). And `req.body` is correctly typed end to end.

## The docs write themselves

Point `@fastify/swagger` at the same routes with a JSON-schema transform, and every endpoint you register shows up in interactive docs - request shapes, response codes, the lot:

    await app.register(swagger, { transform: jsonSchemaTransform });
    await app.register(swaggerUi, { routePrefix: '/docs' });

Add a new field to a Zod schema and the docs update on the next build. Remove one and it disappears. There's no second file to maintain.

## A subtle serialization win

Serializing *through* the response schema is a quiet security feature. Say your user row has a `passwordHash` column. If your response schema doesn't list it, Zod's serializer won't emit it - even if a lazy `select *` pulls it into the object. The schema is a whitelist, not just documentation.

## One gotcha

When you split routes into separate files, the type provider doesn't automatically follow. Re-apply it at the top of each route module so `req.body`/`req.params` stay typed:

    export async function projectRoutes(fastify: FastifyInstance) {
      const app = fastify.withTypeProvider<ZodTypeProvider>();
      // ...register routes on `app`
    }

## Why it matters

Single-source-of-truth schemas remove a whole category of "the docs said one thing, the code did another" bugs. They make refactors safe, they keep your public API honest, and they turn documentation from a chore into a side effect. On this site's own API, every project, tool, and stat endpoint is described exactly once - and the [live docs](/api/docs) are generated straight from it.

*Want an API that's this maintainable? [Let's talk](/#contact).*
