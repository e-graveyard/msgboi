# msgboi

<img src="docs/logo.png" height="210px" align="right"/>

A cloud-native microservice that sends Slack notifications from GitLab events.

- __Ludicrously small.__ The minified & gzipped bundle weights less than 10kb.
- __Fast.__ On AWS Lambda, each execution takes an average of 125 to 250 ms.
- __Minimal.__ In production, only [mustache][mustache] is required.
- __Highly customizable.__ Notification messages can be changed with ease.
- __Multicloud.__ *(WIP)* Deploy on Amazon, Azure, Google or Heroku.

[mustache]: https://github.com/janl/mustache.js
