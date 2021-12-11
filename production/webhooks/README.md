# Setup Webhooks
To enable the webserver to update to the latest image of the website we enable webhooks.

There's 2 different software to setup to do this.
1. [Webhook](https://github.com/adnanh/webhook)
2. [WebhookRelay](https://webhookrelay.com/)

## Webhook
Install webhook from [https://github.com/adnanh/webhook](https://github.com/adnanh/webhook).

```bash
sudo apt-get install webhook
```

Expose webhook:

```bash
webhook -hooks hooks.json -verbose
```

## Webhook Relay
Run the docker image to avoid installing.

```bash
docker-compose up -d
```

## .env
There should be an environment file `.env` in the /production folder. Edit the file to contain the relay authentication and buckets.