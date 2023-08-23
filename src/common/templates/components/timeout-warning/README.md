# Accessible Timeout Warning

This is adapted from a [prototype component on GitHub](https://github.com/hannalaakso/accessible-timeout-warning).
Its [accessibility criteria](https://gist.github.com/hannalaakso/2641fc16d2158e60d551cd9da960b5da) are not currently met
due to point 7: 'Prevent user searching in the underlying page.' due to browser support.

## `govukTimeoutWarning` Nunjucks Macro
### Parameters
All parameters are mandatory.

|Parameter|Description|
|---|---|
|redirectUrl|The path the user should be redirected to if their session times out|
|modalIdleTimeMinutes|How long the user can stay on one page with submitting answers before the timeout modal should be displayed|
|modalVisibleTimeMinutes|How long the user has to refresh their session once the modal is open|

The total duration `modalIdleTimeMinutes + modalVisibleTimeMinutes` should be no longer than the server-side timeout.

### Example
```
{% from "components/timeout-warning/macro.njk" import govukTimeoutWarning %}
{{ govukTimeoutWarning({
    redirectUrl: "/error/no-session",
    modalIdleTimeMinutes: "17",
    modalVisibleTimeMinutes: "3"
}) }}
```
