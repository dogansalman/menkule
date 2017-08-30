function Rules(routerRules) {

    //get request path
    const routePath = location.pathname;

    //find request rule
    const rules = routerRules.filter(r => r.route == routePath);

    //rules exist
    if(rules) {

        rules.forEach(rule => {
            const ruleMethods = rule.method;
            ruleMethods().then(r => { if(r == rule.condition) location.href = rule.backUrl });
        })
    }
}
export default Rules;

