import policy from './policy.handlebars';
export default () => {
  window.document.body.className = "policy";
  new Promise((resolve) => {
     $("body").zone('content').setContentAsync(policy)
      .then(() => resolve())
  })
}
