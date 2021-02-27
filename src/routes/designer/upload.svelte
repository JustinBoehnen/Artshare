<!--Justin Boehnen 2021-->
<script>
    import { onMount } from 'svelte';
    import { getImageHTMLFromFile } from '../../scripts/colorQuantization'
    import { createEventDispatcher } from 'svelte';

    export let loadingOn
    export let loadingOff

    const dispatch = createEventDispatcher()
    var img_file
    var pbn_name = ""
    var pbn_tags = []
    var file_name = ""

    var upload_success = false

    function ParseTags() { 
		if (pbn_tags != '') {
			return pbn_tags
				.split(' ')
				.join('')
				.split(',')
				.map((t) => t.toLowerCase())
		}

		return []
	}

    const clearImageInput = () => {
        var input = document.getElementById('image-input')
        input.value = ''
    }

    const handleFileChange = async (files) => {
        loadingOn()
        const sizeInMB = 2;
        var failed = false;

        if (
        files[0].type !== "image/png" &&
        files[0].type !== "image/jpg" &&
        files[0].type !== "image/jpeg"
        ) {
        alert(
            files[0].name +
            " is not an accepted image format! Accepted formats are:\n.png .jpg .jpeg"
        );
        failed = true;
        }

        if (files[0].size > 1048576 * sizeInMB) {
        alert(
            "File size exceeds " +
            sizeInMB +
            "MB limit! File uploaded was: " +
            (files[0].size / 1048576).toFixed(2) +
            "MB"
        );
        failed = true;
        }

        if (!failed) 
        {
            img_file = files[0]
            file_name = files[0].name
            const img_prev_div = document.getElementById('img-prev-div')
            const img_preview = document.getElementById('img-preview')
            img_prev_div.style.display = "inline"

            upload_success = true
 
            //var canvas = document.getElementById('testcanvas')
            //var ctx = canvas.getContext('2d')

            //quantization vars
            //const smoothing = 8
            //const num_colors = 10

            getImageHTMLFromFile(files[0]).then(htm => {
                img_preview.src=htm.src
                loadingOff()
                
                //canvas.height = htm.height*4 + 30
                //canvas.width = htm.width
                //ctx.drawImage(htm, 0, 0)

                //getImageData(files[0], smoothing).then(img => {
                  //  getDominantColors(files[0], 100).then(pal => {
                  //      console.log(pal.length)
                  //      quantizeImage(img, pal).then(quan => {
                  //          //ctx.putImageData(quan, 0, img.height + 10)
                  //          
                  //          outlineImage(quan, false, 2, [255,0,0]).then(outline_color => {
                  //              //ctx.putImageData(outline_color, 0, img.height*2 + 20)
                  //          })
                  //          outlineImage(quan, true, 1, [0,0,0], [255,255,255]).then(outline_white => {
                  //              //ctx.putImageData(outline_white, 0, img.height*3 + 30)
                  //          })
                  //      })
                  //  })
               // })
            })
        }
        else
        {
            file_name = ""
            const img_prev_div = document.getElementById('img-prev-div')
            img_prev_div.style.display = "none"

            upload_success = false
            clearImageInput()
            loadingOff()
        }
    }

    const validateForm = () => {
        var err = false
        var errstr = "Form Error!"
        if(!upload_success){
            err = true
            errstr += "\n> An image must be uploaded before proceeding"
        }
        if(!/\S/.test(pbn_name)){
            err = true
            errstr += "\n> A valid name must be provided before proceeding"
        }
        if(err){
            alert(errstr)
            return false
        }
        else
            return true
    }

    const handleSubmit = () => {
        loadingOn()
        if(validateForm() == true){
            getImageHTMLFromFile(img_file).then(img_html => {
                loadingOff()
                dispatch('imagesubmit', {img_html:img_html, name: pbn_name, tags: ParseTags(pbn_tags)})
            })
        }
    }
</script>

<div class="container">
    <div class="card">
        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-item">
                <div class="label">name</div>
                <input type="text" bind:value={pbn_name} />
            </div>
            <div class="form-item">
                <div class="label">tags</div>
                <textarea rows="1" type="text" bind:value={pbn_tags} />
            </div>
            <div class="form-item">
                <div class="label">image</div>
                <label class="custom-file-input" for="image-input">upload image</label>
                <div class="file-name">{file_name}</div>
                <input on:change={(e) => handleFileChange(e.target.files)} type="file" accept=".jpg, .jpeg, .png" id="image-input" name="srcimg">
            </div>
            <div class="form-item preview" id="img-prev-div">
                <div class="label">preview</div>
                <img id="img-preview" alt="preview"/>
            </div>
            <div class="form-item">
                <button disabled={!upload_success || !/\S/.test(pbn_name)} type="submit">next step</button>
            </div>
      </form>
    </div>
</div>
<canvas id="testcanvas"></canvas>

<style>
    .card{
        min-width: 15em;
        box-sizing: border-box;
        border-radius: 0.5em;
        box-shadow: 0px 0px 15px 5px #000000;
        margin: 2em;
        background-color: #1687a7;
        display: flex;
        flex-direction: column;
        padding: 1em;
    }
    form{
        display: flex;
        flex-direction: column;
        color: white;
    }
    .label{
        margin-top: 0.5em;
        text-align: center;
    }
    .form-item{
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin: 0.5em
    }
    button {
        width: 100%;
        height: min-content;
        background-color:#276678;
        border-radius:42px;
        display:inline-block;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:15px;
        font-weight:bold;
        padding:10px 39px;
        text-decoration:none;
        margin-top: 1em;
    }
    button:hover {
        background-color:#4a40d4;
    }
    button:active {
        position:relative;
        top:1px;
        outline: none;
    }
    button:disabled,
    button[disabled]{
        background-color: #bbb;
        color: #999;
    }
    input[type='text'] {
		width: 100%;
		margin: 0.5em 0 0 0;
	}
	input[type='text']:focus {
		background-color: #4a40d4;
		color: white;
		outline: none;
	}
    input[type="file"] {
    display: none;
    }
    input[type="file"]{
        display: none;
    }
    .custom-file-input{
        border-radius:42px;
        display:inline-block;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:15px;
        font-weight:bold;
        padding:7.5px 39px;
        text-decoration:none;
        text-align: center;
        margin-top: 0.5em;
        background-color: #276678;
    }
    .custom-file-input:hover{
        background-color: #4a40d4;
    }
    textarea{
        resize: vertical;
        width: 100%;
		margin: 0.5em 0 0 0;
    }
    textarea:focus{
        background-color: #4a40d4;
		color: white;
		outline: none;
    }
    img{
        border-radius: 0.5em;
        width: 100%;
        /*max-width: calc(100vw - 2em);*/
        height: auto;
        margin-top: 0.5em;
    }
    .file-name{
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
    .preview{
        display: none;
    }
</style>