import { Router } from '../lib/index';
import RouterConfig from '../lib/configs/router-config';
import Rules from '../lib/rules';
import RulesConfig from '../lib/configs/rules-config';

//TODO aşırı socket bağlantısı oluyor olabilir kontrol edilmesi gerek reconnect uygulanabilir varsa
/*
Socket new connected
 */
Menkule.isLogged()
    .then((logged) => logged ? Menkule.startSocket(Menkule.getUser()) : null);
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
