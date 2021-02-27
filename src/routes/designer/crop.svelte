<!--Justin Boehnen 2021-->
<script>
    import { onMount } from 'svelte';
    import Cropper from 'svelte-easy-crop';
    import { cropImage } from '../../scripts/colorQuantization'
    import { createEventDispatcher } from 'svelte';

    export let src_img
    export let loadingOn
    export let loadingOff

    const dispatch = createEventDispatcher()
    var crop = { x: 0, y: 0 }
    var zoom = 1 
    var aspectW = 1
    var aspectH = 1
    var cropData

    onMount(()=> {
        aspectW = (src_img.width / src_img.height).toFixed(3)
    })

    const handleSubmit = () => {
        loadingOn()
        cropImage(src_img, cropData.x, cropData.y, cropData.width, cropData.height).then(img_html => {
            loadingOff()
            dispatch('cropsubmit', {img_html})
        })
    }

    const cropComplete = e => {
        cropData = e.detail.pixels
    }

</script>
    
    <div class="container">
        <div class="card">
            <div class="cropper">
                <Cropper on:cropcomplete={cropComplete} restrictPosition=true image={src_img.src} bind:crop bind:zoom zoomSpeed={0.1} aspect={aspectW/aspectH}/>
            </div>
            <div class="aspect-settings">
                <div class="label">
                    adjust aspect ratio
                </div>
                <div class="inputs">
                    <input type="text" bind:value={aspectW} />
                    <div class="divider">:</div>
                    <input type="text" bind:value={aspectH} />
                </div>
            </div>
            <button on:click={handleSubmit}>next step</button>
        </div>
    </div>
    
    <style>
        .card{
            min-width: 15em;
            box-sizing: border-box;
            border-radius: 0.5em;
            box-shadow: 0px 0px 15px 5px #000000;
            margin: 2em;
            background-color: #1687a7;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding:2em 1.5em 1.5em 1.5em;
        }
        .cropper{
            border-radius: 0.5em;
            position: relative;
            width: 100%;
            padding-top: 100%;
            overflow: hidden;
        }
        .aspect-settings{
            display: flex;
            flex-direction: column;
        }
        .label{
            margin-top: 0.5em;
            text-align: center;
        }
        .inputs{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        .divider{
            line-height: 31.78px;
            margin: 0.5em 0.5em 0em 0.5em;
            vertical-align: center;
        }
        button {
            width: 100%;
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
            margin-top: 2em;
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
            height: min-content;
            width: 100%;
            min-width: 4em;
            margin: 0.5em 0 0 0;
        }
        input[type='text']:focus {
            background-color: #4a40d4;
            color: white;
            outline: none;
        }
    </style>