<script>
    import Image from "svelte-image";
    import { createEventDispatcher } from 'svelte';
    import BackArrow from '../../../static/images/icon_arrow_back.svg'
    import IconLike from "../../../static/images/icon_like.svg"
    import IconDislike from "../../../static/images/icon_dislike.svg"
    import dateFormat from 'dateformat'

    export let selectedPBN = {}

    const formatTags = () => {
        let str = ""

        selectedPBN.tags.forEach(element => {
            str += `${element}, `
        });

        return str.substring(0, str.length - 2)
    }
    const dispatch = createEventDispatcher();

    let backClicked = () => {
        dispatch('toggle')
    }
</script>

<div class="container">
    <div class="topbar">
        <div class="back-arrow">
            <img on:click={backClicked} class="back-arrow" src={BackArrow} alt="backarrow"/>
        </div>
        <div class="pbn-name">{selectedPBN.name}</div>
    </div>
    <div class="section">
        <div class="title">Images</div>
        <div class="image-area">
            <div class="large-image">
                <a href={selectedPBN.images["full-size-colored"]} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_colored.jpg`}>
                    <img src={selectedPBN.images["full-size-colored"]} alt="colored"/>
                </a>
            </div>
            <div class="small-image-area">
                <div class="small-image">
                    <a href={selectedPBN.images["full-size-guides"]} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_outlines.jpg`}>
                        <img src={selectedPBN.images["full-size-guides"]} alt="outlines"/>
                    </a>
                </div>
                <div class="small-image">
                    <a href={selectedPBN.images.swatches} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_swatches.jpg`}>
                        <img src={selectedPBN.images.swatches} alt="swatches"/>
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="section">
        <div class="title">Details</div>
        <div class="detail-area">
            <div class="detail-column">
                <div class="detail-item">
                    <div class="detail-title">Created By</div>
                    <div class="detail">{selectedPBN["owner-name"]}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-title">Created On</div>
                    <div class="detail">{dateFormat(selectedPBN.created, "mmmm dS, yyyy, h:MM:ss TT")}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-title">Colors</div>
                    <div class="detail">{selectedPBN["num-colors"]}</div>
                </div>
            </div>
            <div class="detail-column">
                <div class="detail-item">
                    <div class="detail-title">Likes</div>
                    <div class="detail">{selectedPBN.likes}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-title">Dislikes</div>
                    <div class="detail">{selectedPBN.dislikes}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-title">Tags</div>
                    <div class="detail">{formatTags()}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="section">
        <div class="title">Download Links</div>
        <div class="download-area">
            <a href={selectedPBN.images["full-size-colored"]} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_colored.jpg`}>
                <button class="downloadlink">
                    Colored
                </button>
            </a>
            <a href={selectedPBN.images["full-size-guides"]} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_outlines.jpg`}>
                <button class="downloadlink">
                    Outlines
                </button>
            </a>
            <a href={selectedPBN.images.swatches} target="_blank" rel="noopener noreferrer" download={`${selectedPBN.name}_swatches.jpg`}>
                <button class="downloadlink">
                    Swatches
                </button>
            </a>
        </div>
    </div>
    <div class="section">
        <div class="title">Feedback</div>
        <div class="feedback-area">
            <div class="feedback-card">
            <img class="feedback-button" src={IconLike} alt="likes"/>
                {selectedPBN.likes}
            </div>
            <div class="feedback-card">
                <img class="feedback-button" src={IconDislike} alt="dislikes"/>
                {selectedPBN.dislikes}
            </div>
        </div>
    </div>
</div>

<style>
.container{
    margin: 1em 2em 0em 2em;
}
.topbar{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.pbn-name{
    font-size: xx-large;
}
.title{
    text-align: center;
    font-size: x-large;
    margin-bottom: 1em;
}
.image-area{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    align-content: stretch;
}
.large-image{
    min-width: 10em;
    flex-grow: 2;
    flex-shrink: 1;
}
.small-image-area{
    min-width: 5em;
    display: flex;
    flex-grow: 1;
    flex-shrink: 2;
    flex-direction: column;
    margin-left: 1em;
}
img {
  width: 100%;
  height: auto;
}
.feedback-area{
    display: flex;
    justify-content: space-evenly;
}
.feedback-card{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.feedback-button{
    height: 64px;
    width: 64px;
}
.detail-title{
    font-size: small;
}
.detail-item{
    margin: 0.5em;
    margin-top: 0em;
    margin-bottom: 1em;
}
.detail{
    font-size: large;
}
.back-arrow{
    height: 36px;
    width: 36px;
}
.back-arrow:hover{
    cursor: pointer;
    color: #4a40d4;
}
.detail-area{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    flex-wrap: wrap;
}
.detail-area:first-child{
    margin-right: 1em;
}
.detail-column{
    display: flex;
    flex-direction: column;
}
.download-area{
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
}
.section{
    border-radius: 1em;
    background-color: #1687a7;
    color: white;
    padding: 1em;
    margin-top: 1em;
    overflow: hidden;
    text-overflow: "";
}
button {
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
    margin: 0.5em;
}
button:hover {
    background-color:#4a40d4;
}
button:active {
    position:relative;
    top:1px;
    outline: none;
}
</style>