import { ServerRoute } from '@hapi/hapi';
import { UserApi, NewUser, newUserSchema } from '@node-web-frameworks-performance/shared';

const routes: ServerRoute[] = [
  {
    path: '/users',
    method: 'POST',
    options: {
      validate: { payload: newUserSchema },
    },
    async handler(req) {
      const user = await UserApi.addUser(req.payload as NewUser);
      return {
        ...user,
        password: undefined,
      };
    },
  },
];

export { routes as userRoutes };
