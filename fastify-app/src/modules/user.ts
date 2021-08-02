import { FastifyPluginAsync } from 'fastify';
import { UserApi, NewUser, newUserSchema } from '@node-web-frameworks-performance/shared';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: NewUser }>(
    '/users',
    {
      schema: {
        body: newUserSchema,
      },
    },
    async (req, res) => {
      const user = await UserApi.addUser(req.body);
      return {
        ...user,
        password: undefined,
      };
    }
  );
};

export { routes as userRoutes };
