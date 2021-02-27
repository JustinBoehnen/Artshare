<!--Justin Boehnen 2021-->
<script>
    import { onMount } from 'svelte';
    import { quantizeImage, outlineImage } from '../../scripts/colorQuantization'
    import { createEventDispatcher } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips'

    export let loadingOn
    export let loadingOff
    export let src_img
    export let palette
    //export let pbn_name
    //export let pbn_tags

    const dispatch = createEventDispatcher()
    var complexity

    onMount(() => {
		
	})

    const scale = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    const handleGenerate = () => {
        //loadingOn()
        var completed_image = document.getElementById("completed-img")
        var outline_image = document.getElementById("outline-img")

        var blur_rad = Math.round(scale(complexity, 1, 10, 30, 5))
        console.log(blur_rad)

        quantizeImage(src_img, palette, blur_rad, 10).then(quan => {
            completed_image.src = quan.src
            outlineImage(quan, true, 2).then(outline => {
                outline_image.src = outline.src
            })
        })
        
    }
</script>

<div class="container">
    <div class="card">
        <div class="form-item">
            <div class="label">complexity</div>
            <RangeSlider float id="slider" step={1} min={1} max={10} bind:values={complexity} />
        </div>
        <div class="form-item">
            <button on:click={handleGenerate}>generate</button>
        </div>
        <div class="form-item">
            <img id="completed-img" alt="completed"/>
            <img id="outline-img" alt="outline"/>
        </div>
    </div>
</div>
<canvas id="testcanvas"></canvas>

<style>
    .card{
        min-width: 15em;
        color: white;
        box-sizing: border-box;
        border-radius: 0.5em;
        box-shadow: 0px 0px 15px 5px #000000;
        margin: 2em;
        background-color: #1687a7;
        display: flex;
        flex-direction: column;
        padding: 1em;
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
    img{
        border-radius: 0.5em;
        width: 100%;
        /*max-width: calc(100vw - 2em);*/
        height: auto;
        margin-top: 0.5em;
    }
</style>