const xssec = require("@sap/xssec");
const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
const JOB_CREDENTIALS = VCAP_SERVICES.jobscheduler[0].credentials;
const JOB_URL = JOB_CREDENTIALS.url;
const JOB_UAA = JOB_CREDENTIALS.uaa;
const SPACE = "team3601";
const APP = "schedulermulti";
const PATH = "cfapps.eu10-004.hana.ondemand.com";
const ENDPOINT = "catalog/Sales";

const JobSchedulerClient = require("@sap/jobs-client");

const exchangeToken = async (jwtToken, subdomain) => {
  console.log("JOB_UAA: ", JOB_UAA);
  return new Promise((resolve) => {
    xssec.requests.requestUserToken(
      jwtToken,
      JOB_UAA,
      null,
      null,
      subdomain,
      null,
      (error, token) => {
        if (error) {
          console.log("Error data: ", error.data);
        }

        console.log("Token: ", token);
        resolve(token);
      }
    );
  });
};

module.exports = async (jwtToken, subdomain) => {
  console.log("Inside Create job with subdomain: ", subdomain);
  console.log("JWT Token from the Create Job request: ", jwtToken);

  let exchangedToken;
  try {
    exchangedToken = await exchangeToken(jwtToken, subdomain);
  } catch (error) {
    console.log("Error while exchanging token...");
    console.log("Error: ", error);
    throw error;
  }

  console.log("Got the exchanged JWT Token: ", exchangedToken);
  console.log("Let's create the job...");

  const url = `${JOB_URL}/scheduler/jobs`;
  console.log("URL to create job: ", url);

  const options = {
    baseURL: JOB_URL,
    token: exchangedToken,
  };

  const scheduler = new JobSchedulerClient.Scheduler(options);

  const myJob = {
    name: `updatereservation_${new Date().getMilliseconds()}`,
    description: "Cron job that updates reservations",
    // action: `https://${subdomain}-${SPACE}-${APP}.${PATH}/${ENDPOINT}`,
    action: `https://cf-ic2022-team3601-schedulermulti-srv.cfapps.eu10-004.hana.ondemand.com/catalog/Sales`,
    active: true,
    httpMethod: "GET",
    schedules: [
      {
        time: "now",
        active: "true",
      },
    ],
  };

  scheduler.createJob({ job: myJob }, (error, body) => {
    if (error) {
      console.log("Error while exchanging token...");
      console.log("Error: ", error);
      throw error;
    }

    console.log("Response from creating job: ", body);
  });

};
