uniform float theta;
uniform float hsv_height;
uniform float alpha;
uniform float delta_alpha;
varying vec4 pos;

float E = 0.5;
float PI = 3.14159265358979323846264;

bool close(float v1, float v2, float epsilon) {
    if (abs(v2 - v1) < epsilon) {
        return true;
    }
    return false;
}

vec3 pos_to_hsv() {
    float hue, saturation, value, current_radius, current_alpha, x;

    current_radius = pos.z * tan(theta);
    if (close(current_radius, 0.0, 0.001)) {
        current_radius = 0.001;
    }
    x = pos.x;
    if (close(x, 0.0, 0.001)) {
        x = 0.001;
    }
    // current_alpha [-PI, PI]
    current_alpha = atan(pos.y, x);
    // current_alpha [0, 2PI]
    if (current_alpha < 0.0) {
        current_alpha = 2.0 * PI + current_alpha;
    }
    // apply rotating delta
    current_alpha = mod(current_alpha + delta_alpha, 2.0 * PI);
    // from [0, 2PI] to [alpha, 2PI - alpha]
    current_alpha = alpha + current_alpha * (PI - alpha) / PI;
    hue = ((current_alpha - alpha) * PI / (PI - alpha)) * 180.0 / PI;
    saturation = sqrt(x * x + pos.y * pos.y) / current_radius;
    value = pos.z / hsv_height;
    return vec3(hue, saturation, value);
}

vec3 hsv_to_rgb(vec3 hsv) {
    float C, X, H_, m;
    vec3 rgb_;

    C = hsv.z * hsv.y;
    H_ = hsv.x / 60.0;
    X = C * (1.0 - abs(mod(H_, 2.0) - 1.0));
    m = hsv.z - C;

    if (H_ >= 0.0 && H_ < 1.0) {
        rgb_ = vec3(C, X, 0.0);
    } else if (H_ >= 1.0 && H_ < 2.0) {
        rgb_ = vec3(X, C, 0.0);
    } else if (H_ >= 2.0 && H_ < 3.0) {
        rgb_ = vec3(0.0, C, X);
    } else if (H_ >= 3.0 && H_ < 4.0) {
        rgb_ = vec3(0.0, X, C);
    } else if (H_ >= 4.0 && H_ < 5.0) {
        rgb_ = vec3(X, 0.0, C);
    } else if (H_ >= 5.0 && H_ < 6.0) {
        rgb_ = vec3(C, 0.0, X);
    }
    return vec3(rgb_.r + m, rgb_.g + m, rgb_.b + m);
}

void main() {
    float x2, y2, z2, cos_theta2, sin_theta2, kx;
    vec3 hsv, rgb;
    bool cone_border, center_border, cut_border;

    x2 = pos.x * pos.x;
    y2 = pos.y * pos.y;
    z2 = pos.z * pos.z;
    cos_theta2 = cos(theta) * cos(theta);
    sin_theta2 = sin(theta) * sin(theta);
    kx = tan(alpha) * pos.x;

    cone_border = close((x2 + y2) * cos_theta2 - z2 * sin_theta2, 0.0, E);
    center_border = close(pos.x, 0.0, E) && close(pos.y, 0.0, E);
    cut_border = close(pos.z, hsv_height, E) && (close(pos.y, kx, E) &&
          pos.y >= 0.0 || close(pos.y, -1.0 * kx, E) && pos.y < 0.0);

    hsv = pos_to_hsv();
    rgb = hsv_to_rgb(hsv);

    if (cone_border || center_border || cut_border) {
        // Black borders.
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(rgb.r, rgb.g, rgb.b, 1.0);
    }
}
