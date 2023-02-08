const axios = require('axios');
const fs = require('fs');

const debug = console;

const getAccessToken = async (clientId, clientSecret, accessTokenUrl) => {
  // 检索访问令牌
  const tokenResult = await axios.post(
    accessTokenUrl,
    {
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://api.addons.microsoftedge.microsoft.com/.default',
      grant_type: 'client_credentials',
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const accessToken = tokenResult?.data?.access_token;
  debug.info('获取token成功', accessToken);
  return accessToken;
};

const uploadPackage = async (productId, token) => {
  // 上传包以更新现有提交
  const zipStream = fs.createReadStream('./extension.zip');
  let response = await axios.post(
    `https://api.addons.microsoftedge.microsoft.com/v1/products/${productId}/submissions/draft/package`,
    zipStream,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/zip',
      },
    }
  );
  const operationId = response.headers.location;
  if (response.status !== 202) {
    throw new Error('upload fail');
  }
  debug.info('上传包成功');

  // 检查包上传的状态
  const config = {
    method: 'get',
    url: `https://api.addons.microsoftedge.microsoft.com/v1/products/${productId}/submissions/draft/package/operations/${operationId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  let status;
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    response = await axios(config);
    status = response.data.status;

    if (status !== 'InProgress') {
      break;
    }

    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((res) => setTimeout(res, 10000));
  }

  if (status === 'Succeeded') {
    debug.info('检查上传包状态成功');

    return true;
  }

  return false;
};

const sendSubmissionRequest = async (productId, token) => {
  // 发布提交
  let url = `https://api.addons.microsoftedge.microsoft.com/v1/products/${productId}/submissions`;
  let response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
  const operationId = response.headers.location;
  debug.info('发布提交成功', operationId);

  // 检查发布状态
  url = `https://api.addons.microsoftedge.microsoft.com/v1/products/${productId}/submissions/operations/${operationId}`;
  let status = '';
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    response = await axios(url, { headers: { Authorization: `Bearer ${token}` } });
    status = response.data.status;

    if (status !== 'InProgress') {
      break;
    }

    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((res) => setTimeout(res, 10000));
  }

  if (status === 'Succeeded') {
    debug.info('提交请求成功');
    return;
  }

  debug.info('提交请求失败', JSON.stringify(response.data));
  process.exit(1);
};

const run = async ({ productId, clientId, clientSecret, accessTokenUrl }) => {
  const token = await getAccessToken(clientId, clientSecret, accessTokenUrl);
  const uploaded = await uploadPackage(productId, token);

  if (!uploaded) {
    debug.error('Addon not published.');
    return;
  }

  await sendSubmissionRequest(productId, token);
};

(async () => {
  try {
    const accessTokenUrl = 'https://login.microsoftonline.com/5c9eedce-81bc-42f3-8823-48ba6258b391/oauth2/v2.0/token';
    const clientId = '6370ecc6-f298-460b-ae52-1bffb6fe2ba4';
    const clientSecret = 'Rup8Q~56KrBhx6hFhn5PL68snItpgp5576ke~cdh';
    const productId = 'b8afd1eb-98a4-4712-b53e-93b3e4834a99';

    await run({ productId, clientId, clientSecret, accessTokenUrl });
  } catch (error) {
    debug.error(error?.message);
  }
})();
