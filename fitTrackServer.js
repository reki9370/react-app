const secret = process.env.secret;
const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const oracledb = require('oracledb');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateToken(secret, data) {
    const payload = { data };

    const token = jwt.sign(payload, secret);

    return token;
}

function verifyToken(token, secret) {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      // Token verification failed
      console.error('Token verification failed:', error);
      return null;
    }
  }

function generateRandomKey(length) {
    return crypto.randomBytes(length).toString('hex');
}

/* 
    
    function generateRandomKey(length) {
    return crypto.randomBytes(length).toString('hex');
    }

    const secretKey = generateRandomKey(32); // Generate a 32-byte (256-bit) key
    console.log(secretKey);

*/


let pool


oracledb.createPool({
    poolIncrement: 0,
    poolMax: 10,
    poolMin: 10,
    queueMax: -1,
    queueTimeout: 0,
    user          : "ADMIN",
    password      : "FittrackJengA123$",
    connectString : "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-phoenix-1.oraclecloud.com))(connect_data=(service_name=ga10859ba5840f5_fittrackdb_low.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
}).then((newPool) => {
    pool = newPool
    console.log('We managed to connect to Oracle')
    const PORT = process.env.PORT || 3030;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

app.post('/api/ping-oracle', (req, res) => {
    let ID = req.body.ID
    pool.getConnection().then((connect) => {
        connect.execute('SELECT * FROM USERINFO WHERE USERIDENTITY = :ID', {id: ID}, {maxRows: 1}).then((result) => {
            connect.close()
            let withColNames = {}
            let metaData = result.metaData;
            let rows = result.rows

            for(let i = 0; i < metaData.length; i++)
            {
                withColNames[metaData[i].name] = rows[0][i]
            }

            res.end(JSON.stringify(withColNames))
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
});

app.post('/api/add-workout', (req, res) => {
    let ID = req.body.ID
    let workout = req.body.workout
    pool.getConnection().then((connect) => {
        connect.execute("UPDATE USERINFO SET WORKOUTS = :workout WHERE USERIDENTITY = :ID ", {ID: ID, workout: workout}, {maxRows: 1}).then(() => {
            connect.execute("COMMIT").then(() => {
                connect.close()
                res.end(JSON.stringify({}))
            })
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
});

app.post('/api/ping-oracle-no-data', (req, res) => {
    pool.getConnection().then((connect) => {
        connect.execute("SELECT 1 AS dat FROM USERINFO", {}, {maxRows: 1}).then((result) => {
            connect.close()
            res.end(JSON.stringify(result.rows))
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
});

app.post('/api/attempt-to-get', (req, res) => {
    let email = req.body.email
    let token = req.body.token

    //Could check timestamp here. If the token is expired, force the user to log back in before they can proceed with queries. 

    if((! typeof token === 'string' && ! token instanceof String) || token == null || token == undefined)
    {
        res.end(JSON.stringify({error: 'send valid token'}))
    }
    
    let verify = verifyToken(token, secret)

    if(verify.data != email)
    {
        console.log('User Does Not Have Access To This')
        res.end(JSON.stringify({error: 'Access Denied'}))
    }
    else
    {
        console.log('Access Granted')
        res.end(JSON.stringify({access: 'Access Granted'}))
    }

    /*
    pool.getConnection().then((connect) => {
        connect.execute("SELECT * FROM USERINFO", {}, {maxRows: 1}).then((result) => {
            res.end(JSON.stringify(result.rows))
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
    */
});


app.post('/api/get-profile', (req, res) => {
    let email = req.body.email;
    pool.getConnection().then((connect) => {
        connect.execute("SELECT * FROM USERINFO WHERE email = :email", {email: email}, {maxRows: 1}).then((result) => {
            connect.close()
            res.end(JSON.stringify(result.rows))
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
});

app.post('/api/login', (req, res) => {
    let email = req.body.email;
    let fullName = req.body.fullName
    let firstName = req.body.firstName
    let lastName = req.body.lastName

    if(email != '' && email != null && email != undefined)
    {
        pool.getConnection().then((connect) => {
            connect.execute("SELECT CASE WHEN COUNT(*) > 0 THEN 'yup' ELSE 'nope' END AS response FROM USERINFO WHERE email = :email", {email: email}, {maxRows: 1}).then((result) => {
                if(result.rows[0][0] == 'nope')
                {
                    //new user
                    console.log('new user login')
                    connect.execute("INSERT INTO USERINFO (USERIDENTITY, EMAIL, FULLNAME, FIRSTNAME, LASTNAME) VALUES (seq_person.nextval, :email, :fullname, :firstname, :lastname)", {email: email, fullname: fullName, firstname: firstName, lastname: lastName}, {maxRows: 1}).then((result) => { 
                        connect.execute("COMMIT").then(() => {
                            connect.close()
                            let token = generateToken(secret, email)
                            res.end(JSON.stringify({token: token}))
                        })
                    })
                }
                else
                {
                    //existing user
                    console.log('existing user login')
                    let token = generateToken(secret, email)
                    res.end(JSON.stringify({token: token}))
                }
                
            })
        })
        .catch((error) => {
            console.log("ERROR: ", error)
            res.end(JSON.stringify({error: 'This one errored out'}))
        })
    }

    /*
    pool.getConnection().then((connect) => {
        connect.execute("SELECT * FROM USERINFO WHERE email = :email", {email: email}, {maxRows: 1}).then((result) => {
            res.end(JSON.stringify(result.rows))
        }).catch((error) => {
            console.log('Errored On Query: ', error)
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })
    */
});

  

