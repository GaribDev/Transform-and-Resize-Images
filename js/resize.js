// Extracting image from hidden <img> tag to show in input canvas.
// <img> tag is hidden because the input image is being resized to fit in the input canvas,
// thus original image needs to be saved so that it can be resized according to user's demand.
// <input> tag is hidden to keep the interface clean.
let imgElement = document.getElementById("imageOriginal");
let inputElement = document.getElementById("imageUpload");
// Functions detects change in input fields i.e. user is choosing an image.
// Path of chosen image is set as source of original image
inputElement.addEventListener("change", (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false
);
// Resizing the image to fit in the canvas.
// The resolution is maintained while resizing.
// Not resized according to user but according to the dimensions of original image.
imgElement.onload = function () {
    var image = imgElement;
    var canvas = document.getElementById('inputCanvas');
    canvas.width = 800;
    canvas.height = 500;
    var hRatio = canvas.width / image.width;
    var vRatio = canvas.height / image.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - image.width * ratio) / 2;
    var centerShift_y = (canvas.height - image.height * ratio) / 2;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height,
        centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);
};

// Function to resize the image using the user's input.
function resizeImg() {
    console.log("Submitted");
    mat = cv.imread(imgElement);
    let dst = new cv.Mat();
    // getting user's input
    var desired_width = Number(document.getElementById("output_width").value);
    var desired_height = Number(document.getElementById("output_height").value);
    if (desired_width == "" || desired_height == "") {
        alert("Please fill all fields!!");
        return false;
    }
    // using OpenCV to resize and then display in output canvas
    let dsize = new cv.Size(desired_width, desired_height);
    cv.resize(mat, dst, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow("outputCanvas", dst);
}

// funtion to download image.
// download image with the name "resized-image.png"
function download_image() {
    var canvas = document.getElementById("outputCanvas");
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "resized-image.png";
    link.href = image;
    link.click();
    console.log("Downloaded")
    return false;
}