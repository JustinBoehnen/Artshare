<script>
    import { logged_in, TryLogin } from '../../stores/auth-store'
    import { navHeight } from '../../stores/position-store'
    import background from '../../../static/g/images/Login_Background.jpg'

    let password = ""
    let email = ""

    function handleSubmit() {
      TryLogin(email, password)
    }
</script>

<div class="container" style="background-image: url('{background}'); height: calc(100vh - {$navHeight}px);">
  {#if !$logged_in}
    <div class="card">
      <h1>Login</h1>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-item">email</div>
        <label class="form-item">
          <input type="email" bind:value={email} />
        </label>
        <div class="form-item">password</div>
        <label class="form-item">
          <input type="password" bind:value={password} />
        </label>
        <div class="form-item">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  {/if}
  {#if $logged_in}
    <div class="card">
      <h1>Logged In!</h1>
    </div>
  {/if}
</div>

<style>
  .container{
  display: flex;
  background-size: cover;
  align-items: center;
  justify-content: center;
  }
  .card{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 30em;
  background-color: white;
  padding: 2em;
  margin: 0 auto;
  box-sizing: border-box;
  border-radius: 0.5em;
  box-shadow: 0px 0px 15px 5px #000000;
  }
  .form-item{
  display: flex;
  justify-content: center;
  }
  input {
  padding: 5px;
  font-size: 16px;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: #FFFFFF;
  color: #000000;
  border-style: solid;
  border-radius: 0px;
  box-shadow: 0px 0px 5px rgba(66,66,66,.75);
  text-shadow: 0px 0px 5px rgba(66,66,66,.75);
  margin-bottom: 1em;
  }
  button {
  background-color:#c123de;
  border-radius:42px;
  display:inline-block;
  cursor:pointer;
  color:#ffffff;
  font-family:Arial;
  font-size:15px;
  font-weight:bold;
  padding:10px 39px;
  text-decoration:none;
  }
  button:hover {
  background-color:#a20dbd;
  }
  button:active {
  position:relative;
  top:1px;
  }
</style>