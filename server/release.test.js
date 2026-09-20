import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "./app.js";

test("all JSON mutation endpoints reject scalar, null, array and malformed request bodies", async (t) => {
  const server = createApp({ auth: { verifyIdToken: async () => ({ uid: "test" }) }, service: {
    account: async () => ({ role: "owner", plan: "pro", status: "active" }),
    settings: async () => ({ aiEnabled: false }),
  } });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  t.after(() => server.close());
  const routes = [["PUT","workspace"],["POST","history"],["POST","guidance"],["POST","feedback"],["POST","payments"],["POST","export"],["PUT","admin/settings"],["PATCH","admin/users/test"],["PATCH","admin/payments/test"]];
  for (const [method,path] of routes) for (const body of ["null", "[]", "1", '"text"', "{"]) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/${path}`, {method, headers:{Authorization:"Bearer test", "Content-Type":"application/json"}, body});
    assert.equal(response.status,400,`${method} ${path}: ${body}`);
  }
});

const protectedRoutes = [
  ['GET','account'], ['GET','workspace'], ['PUT','workspace'], ['GET','history'], ['POST','history'],
  ['POST','guidance'], ['POST','feedback'], ['GET','payments'], ['POST','payments'], ['POST','billing'],
  ['GET','github?username=example'], ['POST','export'], ['POST','ai'], ['GET','admin'],
  ['PUT','admin/settings'], ['PATCH','admin/users/test'], ['DELETE','admin/users/test'],
  ['PATCH','admin/payments/test'], ['PATCH','admin/feedback/test'],
];
test('every protected route rejects missing, invalid, revoked, expired, disabled and missing-user tokens', async t => {
  const server=createApp({auth:{verifyIdToken:async token=>{throw Object.assign(new Error('Rejected'),{code:'auth/'+token})}},service:{}});
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  for(const [method,path]of protectedRoutes)for(const token of [null,'invalid-id-token','id-token-revoked','id-token-expired','user-disabled','user-not-found']){
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/${path}`,{method,headers:token?{Authorization:'Bearer '+token}:{}});
    assert.equal(response.status,401,`${method} ${path} ${token}`);
    assert.ok(!(await response.text()).includes('workspace'));
  }
});
test('every protected route denies suspended accounts before dispatch',async t=>{
 const deny=async()=>{throw Object.assign(new Error('Account suspended'),{status:403})};
 const server=createApp({auth:{verifyIdToken:async()=>({uid:'suspended'})},service:{account:deny,initialize:deny}});
 server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
 for(const [method,path]of protectedRoutes){const response=await fetch(`http://127.0.0.1:${server.address().port}/api/${path}`,{method,headers:{Authorization:'Bearer test'}});assert.equal(response.status,403,`${method} ${path}`)}
});
test('oversized and non-JSON mutations fail before persistence',async t=>{
 const server=createApp({auth:{verifyIdToken:async()=>({uid:'test'})},service:{account:async()=>({})}});
 server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
 for(const [type,body,status]of [['text/plain','{}',415],['application/json',JSON.stringify({text:'x'.repeat(800001)}),413]]){
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/workspace`,{method:'PUT',headers:{Authorization:'Bearer test','Content-Type':type},body});assert.equal(response.status,status);
 }
});
