# start from node image
FROM node:12.16.2-alpine3.11
ARG NPM_TOKEN
# populate with built agent
COPY dist/ .
# install dependencies
RUN npm install --production
# remove .npmrc file, which contains an auth token
RUN rm -f .npmrc
# run the agent on container start
ENTRYPOINT ["node", "index.js"]