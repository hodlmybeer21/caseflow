import { Router } from 'express';
import { authRouter } from './auth.js';
import { usersRouter } from './users.js';
import { customersRouter } from './customers.js';
import { brandsRouter } from './brands.js';
import { inventoryRouter } from './inventory.js';
import { eventsRouter } from './events.js';
import { promoStaffRouter } from './promo-staff.js';
import { accountAssetsRouter } from './account-assets.js';
import { transfersRouter } from './transfers.js';
import { requestsRouter } from './requests.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/brands', brandsRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/promo-staff', promoStaffRouter);
apiRouter.use('/account-assets', accountAssetsRouter);
apiRouter.use('/transfers', transfersRouter);
apiRouter.use('/requests', requestsRouter);
