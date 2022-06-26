const cds = require('@sap/cds');
const debug = require('debug')('srv:provisioning');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    registry: { tag: 'SaaS' }
});

const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
const JOB_CREDENTIALS = VCAP_SERVICES.jobscheduler[0].credentials;


module.exports = (service) => {

    service.on('UPDATE', 'tenant', async (req, next) => {
        let tenantHost = req.data.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g, '-') + '-' + services.registry.appName.toLowerCase().replace(/_/g, '-');
        let tenantURL = 'https:\/\/' + tenantHost + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[0];
        console.log('Subscribe: ', req.data.subscribedSubdomain, req.data.subscribedTenantId, tenantHost);
        await next();
        return tenantURL;
    });

    service.on('DELETE', 'tenant', async (req, next) => {
        let tenantHost = req.data.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g, '-') + '-' + services.registry.appName.toLowerCase().replace(/_/g, '-');
        console.log('Unsubscribe: ', req.data.subscribedSubdomain, req.data.subscribedTenantId, tenantHost);
        await next();
        return req.data.subscribedTenantId;
    });

    service.on('upgradeTenant', async (req, next) => {
        await next();
        const { instanceData, deploymentOptions } = cds.context.req.body;
        console.log('UpgradeTenant: ', req.data.subscribedTenantId, req.data.subscribedSubdomain, instanceData, deploymentOptions);
    });


    service.on("dependencies", async (req) => {
        console.log("Inside the dependencies...");
        console.log("JOB Credentials: ", JOB_CREDENTIALS);
        console.log("XSAPPNAME: ", JOB_CREDENTIALS.uaa.xsappname);

        console.log("Destination: ", services.dest);

        let dependencies = [
            { xsappname: JOB_CREDENTIALS.uaa.xsappname }
        ];
        console.log("Dependencies: ", dependencies);
        return dependencies;
    });


}