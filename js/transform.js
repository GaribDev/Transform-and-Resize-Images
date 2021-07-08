// array to store point co-ordinates
var input_mat;
// function to detect image upload,
// display the image in canvas,
// shoe the selector points and,
// store thier value
let imageUpload = document.getElementById('imageUpload');
imageUpload.addEventListener('change', function (ev) {
	document.documentElement.scrollTop = 0;
	if (ev.target.files) {
		let file = ev.target.files[0];
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onloadend = function (e) {
			var image = new Image();
			image.src = e.target.result;
			image.onload = function (ev) {
				var inputCanvas = document.getElementById('inputCanvas');
				inputCanvas.width = 800;
				inputCanvas.height = 500;
				var hRatio = inputCanvas.width / image.width;
				var vRatio = inputCanvas.height / image.height;
				var ratio = Math.min(hRatio, vRatio);
				var centerShift_x = (inputCanvas.width - image.width * ratio) / 2;
				var centerShift_y = (inputCanvas.height - image.height * ratio) / 2;
				var ctx = inputCanvas.getContext('2d');
				ctx.drawImage(image, 0, 0, image.width, image.height,
					centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);

				var frameCanvas = document.getElementById('frameCanvas'),
					frameCanvasLeft = frameCanvas.offsetLeft,
					frameCanvasTop = frameCanvas.offsetTop;
				console.log(frameCanvasLeft,frameCanvasTop);
				frameCanvas.width = 800;
				frameCanvas.height = 500;
				var context = frameCanvas.getContext('2d'),
					width = 800,
					height = image.height * ratio;

				var handle0 = {
					x: width / 4,
					y: height / 4,
					radius: 20
				},
					handle1 = {
						x: width * (3 / 4),
						y: height / 4,
						radius: 20
					},
					handle2 = {
						x: width / 4,
						y: height * (3 / 4),
						radius: 20
					},
					handle3 = {
						x: width * (3 / 4),
						y: height * (3 / 4),
						radius: 20
					},
					handles = [handle0, handle1, handle2, handle3],
					offset = {},
					isDragging = false,
					dragHandle;

				draw();
				function draw() {
					context.clearRect(0, 0, width, height);
					context.beginPath();
					context.moveTo(handle0.x, handle0.y);
					context.lineTo(handle1.x, handle1.y);
					context.moveTo(handle1.x, handle1.y);
					context.lineTo(handle3.x, handle3.y);
					context.moveTo(handle3.x, handle3.y);
					context.lineTo(handle2.x, handle2.y);
					context.moveTo(handle2.x, handle2.y);
					context.lineTo(handle0.x, handle0.y);
					context.lineWidth = 3;
					context.strokeStyle = '#0f1923';
					context.stroke();
					context.stroke();

					context.fillStyle = "#ff465460";
					for (var i = 0; i < 4; i += 1) {
						var handle = handles[i];
						if (isDragging && handle === dragHandle) {
							context.shadowColor = "black";
							context.shadowOffsetX = 4;
							context.shadowOffsetY = 4;
							context.shadowBlur = 8;
						}
						context.beginPath();
						context.arc(handle.x, handle.y, handle.radius, 0, Math.PI * 2, false);
						context.fill();
						context.shadowColor = null;
						context.shadowOffsetX = null;
						context.shadowOffsetY = null;
						context.shadowBlur = null;
					}
				}
				var view = document.getElementById("view");
				function circlePointCollision(x, y, circle) {
					var center_x = circle.x+view.offsetLeft+15;
					var center_y = circle.y+view.offsetTop+15;
					return distanceXY(x, y, center_x, center_y) < 40;
				}
				function distanceXY(x0, y0, x1, y1) {
					var dx = x1 - x0,
						dy = y1 - y0;
					return Math.sqrt(dx * dx + dy * dy);
				}
				frameCanvas.addEventListener("mousedown", function (event) {
					console.log(event.clientX, event.clientY);
					for (var i = 0; i < 4; i += 1) {
						var handle = handles[i];
						if (circlePointCollision(event.clientX, event.clientY, handle)) {
							isDragging = true;	
							frameCanvas.addEventListener("mousemove", onMouseMove);
							frameCanvas.addEventListener("mouseup", onMouseUp);
							dragHandle = handle;
							offset.x = event.clientX - handle.x;
							offset.y = event.clientY - handle.y;
							draw();
						}
					}
				});
				function onMouseMove(event) {
					dragHandle.x = event.clientX - offset.x;
					dragHandle.y = event.clientY - offset.y;
					draw();
				}
				function onMouseUp(event) {
					frameCanvas.removeEventListener("mousemove", onMouseMove);
					frameCanvas.removeEventListener("mouseup", onMouseUp);
					isDragging = false;
					input_mat = [handle0.x, handle0.y, handle1.x, handle1.y, handle2.x, handle2.y, handle3.x, handle3.y];
					console.log(input_mat);
					draw();
				}
			}
		}
	}
}
);

// fuction to warap the image according to user's selected points
// image is wraped to resolution of 500X500 by default
// user can choose this resoltion
function transform() {
	var width = Number(document.getElementById("output_width").value);
	var height =Number(document.getElementById("output_height").value);
	if(width == ""){
		width = 500;
	}
	if(height == ""){
		height = 500;
	}
	var outputCanvas = document.getElementById("outputCanvas");
	outputCanvas.width = width;
	outputCanvas.height= height;
	let src = cv.imread('inputCanvas');
	let dst = new cv.Mat();
	let dsize = new cv.Size(width, height);
	let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, input_mat);
	let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, 0, height, width, height]);
	let M = cv.getPerspectiveTransform(srcTri, dstTri);
	cv.warpPerspective(src, dst, M, dsize);
	cv.imshow('outputCanvas', dst);
	src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete();
}

//function to download image 
function download_image(){
    var canvas = document.getElementById("outputCanvas");
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "transformed-image.png";
    link.href = image;
    link.click();
    console.log("Downloaded")
    return false;
}
