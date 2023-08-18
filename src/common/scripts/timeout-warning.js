// Adapted from: https://github.com/hannalaakso/accessible-timeout-warning

exports.setTimeoutWarning = function setTimeoutWarning() {
    function TimeoutWarning($module) {
        this.$module = $module;
        this.$lastFocusedEl = null;
        this.$closeButton = $module.querySelector('.js-dialog-close');
        this.overLayClass = 'govuk-timeout-warning-overlay';
        this.timers = [];
        this.$countdown = $module.querySelector('.timer');
        this.$accessibleCountdown = $module.querySelector('.at-timer');
        this.idleMinutesBeforeTimeOut = $module.getAttribute('data-minutes-idle-timeout');
        this.timeOutRedirectUrl = $module.getAttribute('data-url-redirect');
        this.minutesTimeOutModalVisible = $module.getAttribute('data-minutes-modal-visible');
        this.translatedMinute = $module.getAttribute('data-translated-minute');
        this.translatedMinutes = $module.getAttribute('data-translated-minutes');
        this.translatedSecond = $module.getAttribute('data-translated-second');
        this.translatedSeconds = $module.getAttribute('data-translated-seconds');
        this.translatedBeforeTimer = $module.getAttribute('data-translated-before-timer');
        this.translatedAfterTimer = $module.getAttribute('data-translated-after-timer');
    }

    TimeoutWarning.prototype.init = function () {
        if (!this.$module || !this.dialogSupported()) {
            return;
        }

        this.startTimer();

        this.$closeButton.addEventListener('click', this.closeDialog.bind(this));
        this.$module.addEventListener('keydown', this.escClose.bind(this));
    };

    TimeoutWarning.prototype.dialogSupported = function () {
        if (typeof HTMLDialogElement === 'function') {
            return true;
        }
        try {
            window.dialogPolyfill.registerDialog(this.$module);
            return true;
        } catch (error) {
            return false;
        }
    };

    TimeoutWarning.prototype.startTimer = function () {
        const milliSecondsBeforeTimeOut = this.idleMinutesBeforeTimeOut * 60000;
        this.timers.push(setTimeout(this.openDialog.bind(this), milliSecondsBeforeTimeOut));
        this.timeOutInstantAsUnixMillis =
            Date.now() + milliSecondsBeforeTimeOut + 60000 * this.minutesTimeOutModalVisible;
    };

    TimeoutWarning.prototype.openDialog = function () {
        if (!this.isDialogOpen()) {
            document.querySelector('body').classList.add(this.overLayClass);
            this.saveLastFocusedEl();
            this.$module.showModal();

            this.startUiCountdown();
        }
    };

    // Starts a UI countdown timer. If timer is not cancelled before 0
    // reached + 4 seconds grace period, user is redirected.
    TimeoutWarning.prototype.startUiCountdown = function () {
        this.clearTimers(); // Clear any other modal timers that might have been running
        const $countdown = this.$countdown;
        let $accessibleCountdown = this.$accessibleCountdown;
        let timerRunOnce = false;
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        (function runTimer() {
            // We recompute at this point how long is left using the "wall clock" of Date.now().
            // This is necessary because we can't rely on "setTimeout(x)" coming back after
            // exactly x millis. In particular, if the current tab or window is in the background,
            // then it may "sleep", and a "setTimeout" may get invoked a long time after expected.
            let totalMillisLeft = this.timeOutInstantAsUnixMillis - Date.now();
            let totalSecondsLeft = Math.floor(totalMillisLeft / 1000);

            const minutesLeft = Math.floor(totalSecondsLeft / 60);
            const secondsLeft = totalSecondsLeft % 60;
            const timerExpired = minutesLeft < 1 && secondsLeft < 1;

            const minutesText =
                minutesLeft + '&nbsp;' + (minutesLeft !== 1 ? this.translatedMinutes : this.translatedMinute);
            minutesLeft + '&nbsp;' + (minutesLeft !== 1 ? this.translatedMinutes : this.translatedMinute);
            const secondsText =
                '&nbsp;' +
                ('0' + secondsLeft).slice(-2) +
                '&nbsp;' +
                (secondsLeft !== 1 ? this.translatedSeconds : this.translatedSecond) +
                ',';

            // Attempt to convert numerics into text as iOS VoiceOver occasionally stalled when encountering numbers
            const atMinutesNumberAsText = this.numberToWords(minutesLeft);
            const atSecondsNumberAsText = this.numberToWords(secondsLeft);

            const atMinutesText =
                minutesLeft > 0
                    ? atMinutesNumberAsText + ' ' + (minutesLeft > 1 ? this.translatedMinutes : this.translatedMinute)
                    : '';
            const atSecondsText =
                secondsLeft >= 1
                    ? ' ' +
                      atSecondsNumberAsText +
                      ' ' +
                      (secondsLeft > 1 ? this.translatedSeconds : this.translatedSecond)
                    : '';

            // Below string will get read out by screen readers every time the timeout refreshes (every 15 secs. See below).
            const text = this.translatedBeforeTimer + ' ' + minutesText + secondsText;
            let atText = this.translatedBeforeTimer + ' ' + atMinutesText;
            if (atSecondsText) {
                if (minutesLeft > 0) {
                    atText += ' and';
                }
                atText += atSecondsText;
            }
            atText += ',';

            if (timerExpired) {
                this.redirect();
            } else {
                $countdown.innerHTML = text + ' ' + this.translatedAfterTimer;

                if (minutesLeft < 1 && secondsLeft < 20) {
                    $accessibleCountdown.setAttribute('aria-live', 'assertive');
                }

                if (!timerRunOnce) {
                    // Read out the extra content only once. Don't read out on iOS VoiceOver which stalls on the longer text

                    if (iOS) {
                        $accessibleCountdown.innerHTML = atText;
                    } else {
                        $accessibleCountdown.innerHTML = atText + ' ' + this.translatedAfterTimer;
                    }
                    timerRunOnce = true;
                } else if (secondsLeft % 15 === 0) {
                    // Update screen reader friendly content every 15 secs
                    $accessibleCountdown.innerHTML = atText;
                }

                // Sleep until the second counter needs updating.
                // If the time left is 5.9 sec, sleep for 0.9 sec
                // If the time left is 5.0 sec, sleep for 1 sec
                let sleepMillis = totalMillisLeft % 1000;
                if (sleepMillis === 0) {
                    sleepMillis = 1000;
                }
                this.timers.push(setTimeout(runTimer.bind(this), sleepMillis));
            }
        }).bind(this)();
    };

    TimeoutWarning.prototype.saveLastFocusedEl = function () {
        this.$lastFocusedEl = document.activeElement;
        if (!this.$lastFocusedEl || this.$lastFocusedEl === document.body) {
            this.$lastFocusedEl = null;
        } else {
            this.$lastFocusedEl = document.querySelector(':focus');
        }
    };

    // Set focus back on last focused el when modal closed
    TimeoutWarning.prototype.setFocusOnLastFocusedEl = function () {
        if (this.$lastFocusedEl) {
            window.setTimeout(
                function () {
                    this.$lastFocusedEl.focus();
                }.bind(this),
                0,
            );
        }
    };

    TimeoutWarning.prototype.isDialogOpen = function () {
        return this.$module['open'];
    };

    TimeoutWarning.prototype.closeDialog = function () {
        if (this.isDialogOpen()) {
            document.querySelector('body').classList.remove(this.overLayClass);
            this.$module.close();
            this.setFocusOnLastFocusedEl();

            this.clearTimers();
            this.refreshTimeout();
            this.startTimer();
        }
    };

    TimeoutWarning.prototype.refreshTimeout = function () {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 400) {
                // Session expired before server could refresh it
                this.redirect();
            } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            }
        }.bind(this);

        xhr.open('POST', '/refresh-session-timeout', true);
        xhr.send();
    };

    // Clears modal timer
    TimeoutWarning.prototype.clearTimers = function () {
        this.timers.forEach(clearTimeout);
    };

    // Close modal when ESC pressed
    TimeoutWarning.prototype.escClose = function (event) {
        // get the target element
        if (this.isDialogOpen() && event.keyCode === 27) {
            this.closeDialog();
        }
    };

    TimeoutWarning.prototype.redirect = function () {
        window.location.replace(this.timeOutRedirectUrl);
    };

    TimeoutWarning.prototype.numberToWords = function (n) {
        const string = n.toString();
        let units;
        let tens;
        let scales;
        let start;
        let end;
        let chunks;
        let chunksLen;
        let chunk;
        let ints;
        let i;
        let word;
        let words;

        if (parseInt(string) === 0) {
            return 'zero';
        }

        /* Array of units as words */
        units = [
            '',
            'one',
            'two',
            'three',
            'four',
            'five',
            'six',
            'seven',
            'eight',
            'nine',
            'ten',
            'eleven',
            'twelve',
            'thirteen',
            'fourteen',
            'fifteen',
            'sixteen',
            'seventeen',
            'eighteen',
            'nineteen',
        ];

        /* Array of tens as words */
        tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        /* Array of scales as words */
        scales = [
            '',
            'thousand',
            'million',
            'billion',
            'trillion',
            'quadrillion',
            'quintillion',
            'sextillion',
            'septillion',
            'octillion',
            'nonillion',
            'decillion',
            'undecillion',
            'duodecillion',
            'tredecillion',
            'quatttuor-decillion',
            'quindecillion',
            'sexdecillion',
            'septen-decillion',
            'octodecillion',
            'novemdecillion',
            'vigintillion',
            'centillion',
        ];

        /* Split user arguemnt into 3 digit chunks from right to left */
        start = string.length;
        chunks = [];
        while (start > 0) {
            end = start;
            chunks.push(string.slice((start = Math.max(0, start - 3)), end));
        }

        /* Check if function has enough scale words to be able to stringify the user argument */
        chunksLen = chunks.length;
        if (chunksLen > scales.length) {
            return '';
        }

        /* Stringify each integer in each chunk */
        words = [];
        for (i = 0; i < chunksLen; i++) {
            chunk = parseInt(chunks[i]);

            if (chunk) {
                /* Split chunk into array of individual integers */
                ints = chunks[i].split('').reverse().map(parseFloat);

                /* If tens integer is 1, i.e. 10, then add 10 to units integer */
                if (ints[1] === 1) {
                    ints[0] += 10;
                }

                /* Add scale word if chunk is not zero and array item exists */
                if ((word = scales[i])) {
                    words.push(word);
                }

                /* Add unit word if array item exists */
                if ((word = units[ints[0]])) {
                    words.push(word);
                }

                /* Add tens word if array item exists */
                if ((word = tens[ints[1]])) {
                    words.push(word);
                }

                /* Add hundreds word if array item exists */
                if ((word = units[ints[2]])) {
                    words.push(word + ' hundred');
                }
            }
        }
        return words.reverse().join(' ');
    };
    const $timeoutWarning = document.querySelector('[data-module="govuk-timeout-warning"]');
    if ($timeoutWarning) {
        new TimeoutWarning($timeoutWarning).init();
    }
};
