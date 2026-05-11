/**
 * Das Modul besteht aus der Controller-Klasse für die Entwicklung.
 * @packageDocumentation
 */

import { Hono } from 'hono';
import { container } from '../../container.mts';
import { rolesRequired } from '../../security/roles-required.mts';

export const router = new Hono();

router.post('/db_populate', rolesRequired('admin'), async (c) => {
    await container.dbPopulateService.populate();
    const success = {
        // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
        db_populate: 'ok',
    };
    return c.json(success);
});
