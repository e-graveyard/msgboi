# msgboi

<img src="docs/logo.svg" height="210px" align="right"/>

A cloud-native microservice that sends Slack notifications from GitLab events.

[![Build Status][travis-shield]][travis-url] [![Code Quality][lgtm-shield]][lgtm-url] [![GitHub tag][tag-shield]][tag-url]

- __Ludicrously small.__ The minified & gzipped bundle weights less than 10kb.
- __Fast.__ On AWS Lambda, each execution takes an average of 125 to 250 ms.
- __Minimal.__ In production, only [mustache][mustache] is required.
- __Highly customizable.__ Notification messages can be changed with ease.
- __Multicloud.__ *(WIP)* Deploy on Amazon, Azure, Google or Heroku.

[mustache]: https://github.com/janl/mustache.js

[travis-shield]: https://img.shields.io/travis/caian-org/msgboi.svg?style=for-the-badge
[travis-url]: https://travis-ci.org/caian-org/msgboi

[lgtm-shield]: https://img.shields.io/lgtm/grade/javascript/g/caian-org/msgboi.svg?style=for-the-badge
[lgtm-url]: https://lgtm.com/projects/g/caian-org/msgboi/context:javascript

[tag-shield]: https://img.shields.io/github/tag/caian-org/msgboi.svg?style=for-the-badge
[tag-url]: https://github.com/caian-org/msgboi/releases


## License

To the extent possible under law, [Caian Rais Ertl][me] has waived all
copyright and related or neighboring rights to this work.

[![License][cc-shield]][cc-url]

[me]: https://github.com/caiertl
[cc-shield]: https://forthebadge.com/images/badges/cc-0.svg
[cc-url]: http://creativecommons.org/publicdomain/zero/1.0


## Acknowledgements

Icons made by [smalllikeart][smalllikeart] from [Flaticon][flaticon] is
licensed by [CC 3.0 BY][cc3].

[smalllikeart]: https://www.flaticon.com/authors/smalllikeart
[flaticon]: https://www.flaticon.com
[cc3]: http://creativecommons.org/licenses/by/3.0
