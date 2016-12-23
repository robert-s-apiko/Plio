import { WebApp } from 'meteor/webapp';
import { readFile } from 'fs';
import { _ } from 'meteor/underscore';
import url from 'url';
import { getLastModifiedFileTime, createMd5Hash } from './helpers';

WebApp.connectHandlers.use('/export', (req, res) => {
  const reqUrl = url.parse(req.url, true);
  const fileName = _.last(reqUrl.pathname.split('/'));

  const queryData = reqUrl.query;
  const filePath = `/tmp/${fileName}`;
  const hash = createMd5Hash(getLastModifiedFileTime(filePath));

  function sendNotFound() {
    res.writeHead(404);
    return res.end('Page not found');
  }

  if (hash !== queryData.token) sendNotFound();

  return readFile(filePath, (error, result) => {
    if (error) sendNotFound();

    res.writeHead(200, { 'Content-type': 'text/csv' });
    res.end(result);
  });
});
