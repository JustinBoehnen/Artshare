# Artshare
Artshare is my senior project at Oregon Tech.
The general premise of artshare is that is is both a robust paint-by-number generator and a social platform for sharing paint-by-numbers.

### The Generator
This paint-by-number generator is one of the most robust that has been developed for a web-facing application, and (in my opinion) by far the most customizable. 
The creation process is broken down into the following steps:
1. The user uploads an image from their computer.
2. The user crops the image with interactive handles and a bounding box (if desired).
3. The user clicks on the image to select colors they wish to be in the final image, or they may chose to have the application pick a desired number of colors for them. A best distinct color algorithm is utilized to ensure that the colors automatically picked will give the final image high contrast and a wide color variety.
#### So begins the color quantization, outlining, and labelling steps:
4. The user then sees a preview of the final paint by number (before any customization).
5. If the user desires to do so they may customize everything from:
    - Quantization cell density (how big or small the average color region is, including minimum region size)
    - Background color
    - Outline color and size (or the option to remove outlines all together)
    - Label color and size (or the option to remove outlines all together)
    - And even the attributes of the gaussian blur used before quantization, which can heavily effect the clarity of the final image. In practice increasing blur leads to an easier to paint image while decreasing blue makes for a far more detailed but advanced artwork.
    - and more.
6. If happy with the pre-generated image or their option selections the user may generate a final image. (If they are unhappy with that image the user is welcome to go to any previous step whenever they wish)
7. Once the final image is generated the user can download the following files:
    - The original (cropped) uploaded image
    - The image the user is supposed to paint (outlines and number labels)
    - What the completed (painted) artwork should look like (with outlines and labels)
    - What the completed (painted) artwork should look like (without outlines and labels)
8. The user is welcome to download these files individually or all together in a compressed .zip archive without any futher obligation.
9. Or, they may share their paint-by-number with other users on the site (detailed in the social aspect), wherin all the images listed in step 7 are available for download.

### The Social Aspect
Once done creating their paint-by-number a user is prompted to upload their newly-created artwork (if they'd like). If they choose to do so they will be asked to name their work, choose an alias to upload the work under (if they are not logged in), and then tag their work with as many keywords as they can think of.
From there the paint-by-number will be uploaded to my database and then be accessible to any user on the site via the explore page. On the explore page users may filter and sort artwork by many different specifiers, including but not limited to:
- Number of colors in the artwork (paint colors needed)
- Any number of tags the original creator decided to add
- Number of likes or dislikes the artwork has recieved

If the user is logged in when they upload their artwork after creation (the user is prompted to log in or make an account at that time) then they have special control of their uploaded artwork in the explore page, specifically they are given the option to delete their artwork without any intervention needed by site administrators.

Additionally, users in the explore page may like or dislike images to boost or supress the images likelihood to be found by other users. They also have the option to report the image for innapropriate content.

###### This application (front and back) was developed with svelte
