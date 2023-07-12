const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const oracledb = require('oracledb');

let pool

oracledb.createPool({
    poolIncrement: 1,
    poolMax: 25,
    poolMin: 10,
    queueMax: -1,
    queueTimeout: 0,
    user          : "ADMIN",
    password      : "FittrackJengA123$",
    connectString : "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-phoenix-1.oraclecloud.com))(connect_data=(service_name=ga10859ba5840f5_fittrackdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
}).then((newPool) => {
    pool = newPool
    const port = 3000;
    const ip = '192.168.67.239';
    app.listen(port, ip, () => {
        console.log(`Server running on port ${port}`);
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
});

app.post('/api/get-profile', (req, res) => {
    let email = req.body.email;
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
});

app.post('/api/login', (req, res) => {
    let email = req.body.email;
    let fullName = req.body.fullName
    let firstName = req.body.firstName
    let lastName = req.body.lastName

    pool.getConnection().then((connect) => {
        connect.execute("SELECT CASE WHEN COUNT(*) > 0 THEN 'yup' ELSE 'nope' END AS response FROM USERINFO WHERE email = :email", {email: email}, {maxRows: 1}).then((result) => {
            if(result.rows[0][0] == 'nope')
            {
                //new user
                console.log('new user login')
                connect.execute("INSERT INTO USERINFO (USERIDENTITY, EMAIL, FULLNAME, FIRSTNAME, LASTNAME) VALUES (seq_person.nextval, :email, :fullname, :firstname, :lastname)", {email: email, fullname: fullName, firstname: firstName, lastname: lastName}, {maxRows: 1}).then((result) => { 
                    connect.execute("COMMIT").then(() => {
                        connect.close()
                        res.end(JSON.stringify({userCreated: 'we created a new user'}))
                    })
                })
            }
            else
            {
                //existing user
                console.log('existing user login')
                res.end(JSON.stringify({userCreated: 'this user already exists'}))
            }
            
        })
    })
    .catch((error) => {
        console.log("ERROR: ", error)
        res.end(JSON.stringify({error: 'This one errored out'}))
    })

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

  

