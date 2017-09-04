import { Router } from '../lib/index';
import RouterConfig from '../lib/configs/router-config';
import Rules from '../lib/rules';
import RulesConfig from '../lib/configs/rules-config';

/*
 Create router instance with router config
 */
const router = new Router(RouterConfig);

/*
 Execute rules
 */
Rules(RulesConfig);

/*
 Router on resolve
 */
router.on('resolve', () => App.hidePreloader());

/*
 Execute router
 */
router.resolve();
