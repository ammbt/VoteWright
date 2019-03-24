# VoteWright
A fair (bear?) and balanced vote tracking system.

## Dev environment setup
* Install Node
* Run the following commands
```npm install ionic -g```


## Installing the app
* Clone the app
* In the app directory run
```npm install```

## Configuration
Currently in order to run the app locally or build it as an app you need to provide
the configuration for connecting to firebase. You will need to add app-config.json
to the root and configure the following values (which can be retrieved from your
firebase account.)
```
{
    "firebaseKey": "",
    "firebaseDomain": "",
    "firebaseURL": "",
    "firebaseProjectId": "",
    "firebaseStorageBucket": "",
    "firebaseMessagingSenderId": ""
}
```

## Running the app
```ionic serve -c```

## Building the app for android
```ionic cordova build android```
or
```ionic cordova build --release android```


## TODOs
### Accessibility
- [ ] Always visible labels on form fields. - Tom
### Add login
- [x] Use social media account (Facebook?) for OAuth.
- [x] Enable security in firebase based on user.
### Theme
- [ ] New CSS color palettes. - Molly
- [ ] New custom icons.
- [ ] New custom splash page. - Mallory
- [ ] New font?
### UI/UX
- [ ] General improvements to the flow and behavior of the app.
- [ ] Add form fields for direct point input. - Tom
- [ ] Toggle editable point fields.
- [ ] Improve the update points button (better text and placement). - Molly
- [ ] Disable the add player button when the input fields are not set.
- [x] Add a sort by last played to the players list
- [ ] Add a filter by last played to the players list
- [ ] Add a new page for displaying and selecting groups as an alternative to selecting players. This should match some of the behavior of the players page (searching, filtering, etc.)
