(function(root) {

    var ASPECT = $(window).width() / $(window).height(),
        VIEW_ANGLE = 20,
        NEAR = 0.1,
        FAR = 1000,
        HSV_R = 50,
        HSV_HEIGHT = 150,
        HSV_ALPHA = 45 * Math.PI / 180,
        X0 = 0,
        Y0 = 0,
        Z0 = 0;

    function HSV() {
        var hsvTheta = Math.atan(HSV_R / HSV_HEIGHT),
            xT = X0,
            yT = Y0,
            xR = xL = X0 + HSV_R * Math.cos(HSV_ALPHA),
            yR = Y0 + HSV_R * Math.sin(HSV_ALPHA),
            yL = Y0 - HSV_R * Math.sin(HSV_ALPHA),
            zR = zL = zT = Z0 + HSV_HEIGHT,

            scene = new THREE.Scene(),
            camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR),
            controls = new THREE.TrackballControls(camera),
            renderer = new THREE.WebGLRenderer(),

            vShader = $('#vertex-shader').text(),
            fShader = $('#fragment-shader').text(),
            uniforms,
            hsvMaterial,
            hsvGeometry,
            deltaAlpha = 0;

        setupScene();

        uniforms = {
            theta: {
                type: 'f',
                value: hsvTheta
            },
            hsv_height: {
                type: 'f',
                value: HSV_HEIGHT
            },
            alpha: {
                type: 'f',
                value: HSV_ALPHA
            },
            delta_alpha: {
                type: 'f',
                value: deltaAlpha
            }
        };

        hsvMaterial = new THREE.ShaderMaterial({
            vertexShader: vShader,
            fragmentShader: fShader,
            uniforms: uniforms
        });

        hsvGeometry = new THREE.Geometry();
        hsvGeometry.vertices.push(
                new THREE.Vector3(X0, Y0, Z0),
                new THREE.Vector3(xL, yL, zL),
                new THREE.Vector3(xT, yT, zT),
                new THREE.Vector3(xR, yR, zR));
        hsvGeometry.faces.push(
                new THREE.Face3(2, 1, 0),
                new THREE.Face3(0, 3, 2));

        for (var alpha = HSV_ALPHA + 0.01; alpha <= 2 * Math.PI - HSV_ALPHA; alpha += 0.01) {
            hsvGeometry.vertices.push(
                    new THREE.Vector3(
                            X0 + HSV_R * Math.cos(alpha),
                            Y0 + HSV_R * Math.sin(alpha),
                            zT));
            hsvGeometry.faces.push(new THREE.Face3(
                    hsvGeometry.vertices.length - 2,
                    hsvGeometry.vertices.length - 1,
                    2));
            hsvGeometry.faces.push(new THREE.Face3(
                    0,
                    hsvGeometry.vertices.length - 1,
                    hsvGeometry.vertices.length - 2));
        }

        hsv = new THREE.Mesh(hsvGeometry, hsvMaterial);
        scene.add(hsv);
        render();
        $(renderer.domElement).on('click', onPick);

        function onPick(e) {
            var vector,
                newAlpha,
                point,
                color,
                projector,
                raycaster,
                intersects,
                x, y;

            x = e.clientX - $(renderer.domElement).offset().left;
            y = e.clientY - $(renderer.domElement).offset().top;

            vector = new THREE.Vector3(
                    (x / $(renderer.domElement).width()) * 2 - 1,
                    -(y / $(renderer.domElement).height()) * 2 + 1, 0.5);
            projector = new THREE.Projector();
            projector.unprojectVector(vector, camera);

            raycaster = new THREE.Raycaster(
                    camera.position,
                    vector.sub(camera.position).normalize());

            intersects = raycaster.intersectObject(hsv);

            if (intersects.length > 0) {
                point = intersects[0].point;
                if (close(point.z, zT, 0.001)) {
                    newAlpha = Math.atan2(point.y, point.x);
                    if (newAlpha < 0) {
                        newAlpha = 2 * Math.PI + newAlpha; 
                    }
                    deltaAlpha += newAlpha - HSV_ALPHA;
                    uniforms.delta_alpha.value = deltaAlpha;
                } else {
                    color = getColorFromPoint(point, deltaAlpha);
                    displayPickedColor(color);
                }
            }
        }

        function getColorFromPoint(point, deltaAlpha) {
            var color, hsvColor, hslColor;

            color = new THREE.Color();
            hsvColor = posToHsv(point, HSV_ALPHA, HSV_R, HSV_HEIGHT, deltaAlpha);
            hslColor = hsvToHsl(hsvColor);
            color.hsv = hsvColor;
            color.setHSL(
                    hslColor.hue / 360, hslColor.saturation, hslColor.lightness);
            return color;
        }

        function displayPickedColor(color) {
            $('#color-picked').css('background-color', color.getStyle());
            $('.colorRgb').text(round(255 * color.r) + ', ' +
                    round(255 * color.g) + ', ' + round(255 * color.b));
            $('.colorHex').text(color.getHexString());
            $('.colorHsv').text(round(color.hsv.hue) + ', ' +
                    round(color.hsv.saturation, 2) + ', ' +
                    round(color.hsv.value, 2));
        }

        function setupScene() {
            var $viewport = $('#viewport');

            camera.position.z = 530;
            camera.position.x = 300;
            camera.position.y = 80;
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;

            renderer.setSize($viewport.width(), $viewport.height());
            $viewport.append(renderer.domElement);
        }

        function render() {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            controls.update();
        }
    }

    $.extend(root, {
        'HSV': HSV
    });
})(this);
