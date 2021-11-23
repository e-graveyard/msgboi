[![Build & Check][gh-bnc-shield]][gh-bnc-url]
[![Code Quality][lgtm-shield]][lgtm-url]
[![GitHub tag][tag-shield]][tag-url]

# msgboi

<img src="logo.svg" height="210px" align="right"/>

A cloud-native microservice that sends Slack notifications from GitLab events.

- __Ludicrously small.__ The minified & gzipped bundle weights less than 10kb.
- __Fast.__ On AWS Lambda, each execution takes an average of 125 to 250 ms.
- __Minimal.__ In production, only [mustache][mustache] is required.
- __Highly customizable.__ Notification messages can be changed with ease.
- __Multicloud.__ *(WIP)* Deploy on Amazon, Azure, Google or Heroku.

[mustache]: https://github.com/janl/mustache.js

[gh-bnc-shield]: https://img.shields.io/github/workflow/status/caian-org/msgboi/build-and-check?label=build%20%26%20check&logo=github&style=flat-square
[gh-bnc-url]: https://github.com/caian-org/msgboi/actions/workflows/build-and-check.yml

[lgtm-shield]: https://img.shields.io/lgtm/grade/javascript/g/caian-org/msgboi.svg?logo=lgtm&style=flat-square
[lgtm-url]: https://lgtm.com/projects/g/caian-org/msgboi/context:javascript

[tag-shield]: https://img.shields.io/github/tag/caian-org/msgboi.svg?logo=git&logoColor=FFF&style=flat-square
[tag-url]: https://github.com/caian-org/msgboi/releases


## License

To the extent possible under law, [Caian Ertl][me] has waived __all copyright
and related or neighboring rights to this work__. In the spirit of _freedom of
information_, I encourage you to fork, modify, change, share, or do whatever
you like with this project! [`^C ^V`][kopimi]

[![License][cc-shield]][cc-url]

[me]: https://github.com/upsetbit
[cc-shield]: https://forthebadge.com/images/badges/cc-0.svg
[cc-url]: http://creativecommons.org/publicdomain/zero/1.0

[kopimi]: https://kopimi.com
