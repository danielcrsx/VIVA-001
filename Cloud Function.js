// From here, there are all the required libraries to be loaded
const { conversation } = require('@assistant/conversation'); // This the app coversation
const functions = require('firebase-functions'); //These are the firebase functions
require('firebase-functions/lib/logger/compat'); // console.log compact
const axios = require('axios'); // This is axios to retrieve the data stream
// To here, there all the required libraries to be loaded

// Create conversation Instance
const app = conversation({debug: true}); // This instantiate the conversation

/* This function retrieve the data from the file stream */
async function getItem() {
    const res = await axios.get('https://sheetdb.io/api/v1/59icmymv3xo4w'); //Currently, using test stream
    return res.data; // To use in your Action's response
}

/**
 * CASE STUDY 1 - This functions matches user's element query
 * to location in data stream
 */
app.handle('getItem', async conv => { //getItem is the webhook name used in Google Actions, conv is the conversation
    const data = await getItem(); // Here the data stream is retrieved and send to the data variable
//   console.log(data);
    const typeUser = conv.intent.params.Item.resolved; // This is the user's response, in other words, what item the user's want to know from the data.
    const typeIDUser = conv.intent.params.Item_ID.resolved.replace(/\s/g, ''); //This is the user's response for item ID
    const itemUser = typeUser + " " + typeIDUser;
    console.log(typeUser);
    console.log(typeIDUser);
    console.log(itemUser);
//   conv.add(`This test to see if we are accessing the webhook for ${typeUser}`); // This is to know if I was getting the correct item from the user. Currently this is working
//   console.log(data);
    data.map(BIMData  => { //Then, I am trying to map the data stream to recognize the data headers and identify items
//     console.log(data);
//     console.log(BIMData);
        if (BIMData.Name.toLowerCase() === itemUser.toLowerCase()){

            if (BIMData.Name.toLowerCase().includes('window') || BIMData.Name.toLowerCase().includes('door')) {
                console.log(BIMData);
                conv.add(`These are the details for ${itemUser} of type ${BIMData.ElementType}. It will be installed in zone ${BIMData.Zone}, at ${BIMData.Level}.`);
            } else {
                console.log(BIMData);
                conv.add(`These are the details for ${itemUser}. It will be installed in zone ${BIMData.Zone}, at ${BIMData.Level}.`);
            }
//         console.log(conv);
// 		    console.log(data);
        }
//     else {
//       conv.add(`I am sorry. I could not find any information about that object. Please try with another construction object.`);
//       }
    });
});

/**
 * CASE STUDY 2 - This function retrieves number of items per level for a specified item
 **/
app.handle('getNumItems', async conv => {
    const data = await getItem(); //Receiving data stream
    // console.log(data); //checking the data on log

    //** Identifying user parameters **//

    //Start with element name
    const TypeUser = conv.intent.params.ItemType.resolved;
    // console.log(TypeUser + " Element Type");

    //Identify level
    const LevelUser = conv.intent.params.item_Level.resolved;
    // console.log(LevelUser + " User Level");

    //Identify Element Type
    const TypeIDUser = conv.intent.params.TypeID.resolved.replace(/\s/g, '');
    // console.log(TypeIDUser + " Element Type ID");

    /**
     * Map items and count items that comlpy checks
     * @type {number}
     */
    let countOfItems = 0;
    const itemsFound = [];

    data.map(numItems => {

            //** Mapping data to find number of items per level **//
            //Defining comparison parameters
            const checkElementTypeOnName = numItems.Name.toLowerCase().includes(TypeUser.toLowerCase());
            const checkSameTypeParameter = numItems.ElementType.toLowerCase() === TypeIDUser.toLowerCase();
            const checkLevel = numItems.ItemLevel.toLowerCase() === LevelUser.toLowerCase();

            //print comparissons
            // console.log("Check Element Type on Name: " +
            //     checkElementTypeOnName +
            //     ". CheckType Parameter: " +
            //     checkSameTypeParameter +
            //     ". ALL Parameters: " +
            //     (checkElementTypeOnName && checkSameTypeParameter) +
            //     ". DONE!!!!");
            // console.log(checkSameTypeParameter);
            // console.log(checkLevel);

            if (checkElementTypeOnName &&
                checkSameTypeParameter &&
                checkLevel
                // && numItems.ElementType.toLowerCase() === TypeIDUser.toLowerCase()
                // && (numItems.ItemLevel.toLowerCase() === LevelUser.toLowerCase())
            )
            {
                //print comparissons
                console.log("Check Element Type on Name: " +
                    checkElementTypeOnName +
                    ". Check Type ID Parameter: " +
                    checkSameTypeParameter +
                    ". Check Level: " +
                    checkLevel +
                    ". ALL Parameters: " +
                    (checkElementTypeOnName && checkSameTypeParameter && checkLevel) +
                    ". DONE!!!!");
                // console.log(checkSameTypeParameter);
                // console.log(checkLevel);

                ++countOfItems;
                console.log(countOfItems);
                itemsFound.push(numItems);
                console.log(itemsFound);
            }
            // console.log(countOfItems);
            console.log("Check Element Type on Name: " +
                checkElementTypeOnName +
                ". Check Type ID Parameter: " +
                checkSameTypeParameter +
                ". Check Level: " +
                checkLevel +
                ". ALL Parameters: " +
                (checkElementTypeOnName && checkSameTypeParameter && checkLevel) +
                ". WRONG!!!!");
            // console.log(checkSameTypeParameter);
            // console.log(checkLevel);
        }
    );
    conv.add(`There are ${countOfItems} ${TypeUser}s of type ${TypeIDUser.toUpperCase()} in the ${LevelUser}.`);

});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
