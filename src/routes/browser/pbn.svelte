<script>
    import Image from "svelte-image";
    import { createEventDispatcher, onMount } from 'svelte';
    import { user, logged_in } from '../../stores/auth-store'
    import BackArrow from '../../../static/images/icon_arrow_back.svg'
    import IconLike from "../../../static/images/icon_like.svg"
    import IconDislike from "../../../static/images/icon_dislike.svg"
    import dateFormat from 'dateformat'

    export let selectedPBN = {}
    var user_likes
    var like_modify_value = 0
    var dislike_modify_value = 0

    onMount(()=> {
        const like = document.getElementById("like-icon")
        const dislike = document.getElementById("dislike-icon")

        if(selectedPBN.likers.includes($user.id)){
            user_likes = true
            like.style.fill="orange"
        }
        else if(selectedPBN.dislikers.includes($user.id)){
            user_likes = false
            dislike.style.fill="orange"
        }
    })

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

    const likePBN = () => {
        const like = document.getElementById("like-icon")
        const dislike = document.getElementById("dislike-icon")
        dislike.style.fill="#fff"
        like.style.fill="orange"

        if(!user_likes){
            like_modify_value = 1
            dislike_modify_value = -1
        }else{
            like_modify_value = 0
            dislike_modify_value = 0
        }

        const body = {
            userid: $user.id,
            pbnid: selectedPBN._id
        }

        return new Promise((resolve) => {
            fetch(`http://localhost:3000/browser/like.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                response.blob().then(blob => {
                    var reader = new FileReader()
                    reader.readAsDataURL(blob)
                    reader.onload = (e) => {
                        resolve(e.target.result)
                    }
                })
            })
        })
	}

    const dislikePBN = () => {
        const like = document.getElementById("like-icon")
        const dislike = document.getElementById("dislike-icon")
        dislike.style.fill="orange"
        like.style.fill="#fff"

        if(user_likes){
            like_modify_value = -1
            dislike_modify_value = 1
        }else{
            like_modify_value = 0
            dislike_modify_value = 0
        }

        const body = {
            userid: $user.id,
            pbnid: selectedPBN._id
        }

        return new Promise((resolve) => {
            fetch(`http://localhost:3000/browser/dislike.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                response.blob().then(blob => {
                    var reader = new FileReader()
                    reader.readAsDataURL(blob)
                    reader.onload = (e) => {
                        resolve(e.target.result)
                    }
                })
            })
        })
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
    {#if $logged_in}
        <div class="section">
            <div class="title">Feedback</div>
            <div class="feedback-area">
                <div on:click={likePBN} class="feedback-card">
                    <svg id="like-icon" class="feedback-button" xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                    {selectedPBN.likes + like_modify_value}
                </div>
                <div on:click={dislikePBN} class="feedback-card">
                    <svg id="dislike-icon" class="feedback-button" xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
                    {selectedPBN.dislikes + dislike_modify_value}
                </div>
            </div>
        </div>
    {/if}
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
    cursor: pointer;
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