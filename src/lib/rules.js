function Rules(routerRules) {

    //get request path
    const routePath = location.pathname;

    //find request rule
    const rule = routerRules.find(r => r.route == routePath);



    //exist rule
    if(rule) {
        const ruleMethods = rule.method;
        ruleMethods().then(r => { if(r == rule.condition) location.href = rule.backUrl });
    }
}
export default Rules;

