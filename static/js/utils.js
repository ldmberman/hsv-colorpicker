(function(root) {

    function posToHsv(pos, alpha, radius, height, deltaAlpha) {
        var hue, saturation, value, current_radius, current_alpha, x;

        current_radius = pos.z * radius / height;
        if (close(current_radius, 0.0, 0.001)) {
            current_radius = 0.001;
        }
        x = pos.x;
        if (close(x, 0.0, 0.001)) {
            x = 0.001;
        }
        // current_alpha [-PI, PI]
        current_alpha = Math.atan2(pos.y, x);
        // current_alpha [0, 2PI]
        if (current_alpha < 0) {
          current_alpha = 2 * Math.PI + current_alpha;
        }
        // apply rotating delta
        current_alpha = (current_alpha + deltaAlpha) % (2 * Math.PI);
        // from [0, 2PI] to [alpha, 2PI - alpha]
        current_alpha = alpha + current_alpha * (Math.PI - alpha) / Math.PI;
        hue = ((current_alpha - alpha) * Math.PI / (Math.PI - alpha)) * 180 / Math.PI;
        saturation = Math.sqrt(x * x + pos.y * pos.y) / current_radius;
        value = pos.z / height;
        return {
            hue: hue,
            saturation: saturation,
            value: value
        };
    }

    function hsvToHsl(hsv) {
        var hue_, saturation_, lightness;

        hue_ = hsv.hue;
        lightness = (2 - hsv.saturation) * hsv.value;
        saturation_ = hsv.saturation * hsv.value;
        saturation_ /= lightness <= 1 ? lightness : 2 - lightness;
        lightness /= 2;
        return {
            hue: hue_,
            saturation: saturation_,
            lightness: lightness
        }
    }

    function close(a, b, E) {
        if (Math.abs(b - a) < E) {
            return true;
        }
        return false;
    }

    function round(a, digits) {
        digits || (digits = 0);
        return Math.round(a * Math.pow(10, digits)) / Math.pow(10, digits);
    }

    $.extend(this, {
        'posToHsv': posToHsv,
        'hsvToHsl': hsvToHsl,
        'close': close,
        'round': round
    });

})(this);