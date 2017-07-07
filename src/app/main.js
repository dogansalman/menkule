import { Router } from '../lib/index';
import RouterConfig from './router-config';

// Create router instance with router config
const router = new Router(RouterConfig);

// Router on resolve
router.on('resolve', () => App.hidePreloader());

// Execute router
router.resolve();
