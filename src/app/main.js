import { Router } from '../lib/index';
import RouterConfig from './router-config';
import Rules from '../lib/rules';
import RouteRules from './router-rules';

// Create router instance with router config
const router = new Router(RouterConfig);

//Execute rules
Rules(RouteRules);

// Router on resolve
router.on('resolve', () => App.hidePreloader());


// Execute router
router.resolve();
