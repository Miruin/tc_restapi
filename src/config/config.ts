import {config} from 'dotenv';
config();

export default{

    port: process.env.PORT || 3000,
    
    dbuser: process.env.DB_USER || '',
    dbpw: process.env.DB_PW || '',
    dbserver: process.env.DB_SERVER || '',
    dbdatabase: process.env.DB_DATABASE || '',

    q1: process.env.Q1,
    q2: process.env.Q2,
    q2_1: process.env.Q2_1,
    q3: process.env.Q3,
    q3_1: process.env.Q3_1,
    q3_2: process.env.Q3_2,
    q3_3: process.env.Q3_3,
    q3_4: process.env.Q3_4,
    q4: process.env.Q4,
    q5: process.env.Q5,
    q6: process.env.Q6,
    q6_1: process.env.Q6_1,
    q6_2: process.env.Q6_2,
    q6_3: process.env.Q6_3,
    q7: process.env.Q7,
    q8: process.env.Q8,
    q8_1: process.env.Q8_1,
    q9: process.env.Q9,
    q10: process.env.Q10,
    q10_1: process.env.Q10_1,
    q10_2: process.env.Q10_2,
    q11: process.env.Q11,
    q12: process.env.Q12,
    q13: process.env.Q13,

    secrettoken: process.env.SECRET_TOKEN

};