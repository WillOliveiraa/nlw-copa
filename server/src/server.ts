import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { z as zod } from 'zod';
import ShortUniqueId from 'short-unique-id';

const prisma = new PrismaClient({ log: ['query'] });

async function boostrap() {
    const fastify = Fastify({
        logger: true,
    });

    await fastify.register(cors, { origin: true });

    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count();

        return { count };
    });

    fastify.get('/users/count', async () => {
        const count = await prisma.user.count();

        return { count };
    });

    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count();

        return { count };
    });

    fastify.post('/pools', async (request, reply) => {
        const createPoolBody = zod.object({
            title: zod.string(),
        });

        const { title } = createPoolBody.parse(request.body);

        const generateCode = new ShortUniqueId({ length: 6 });

        const code = String(generateCode()).toUpperCase();

        await prisma.pool.create({
            data: {
                title,
                code,
            },
        });

        return reply.status(201).send({ code });
    });

    await fastify.listen({ port: 3333 });
}

boostrap();
