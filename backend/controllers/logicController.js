const pool = require("../config/db");


// GET LOGIC


const getLogic = async (req, res) => {

    try {

        const { questionId } = req.params;

        const result = await pool.query(

            `
            SELECT

                ql.id,

                ql.question_id,

                ql.option_id,

                ql.next_question_id,

                qo.option_text

            FROM question_logic ql

            JOIN question_options qo

                ON qo.id = ql.option_id

            WHERE ql.question_id = $1

            ORDER BY qo.option_order;
            `,

            [questionId]

        );

        res.json(result.rows);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server error"

        });

    }

};

// SAVE LOGIC

const saveLogic = async(req,res)=>{

    try{

        const{

            question_id,
            option_id,
            next_question_id

        }=req.body;

        const exists=await pool.query(

            `
            SELECT *
            FROM question_logic
            WHERE option_id=$1
            `,

            [option_id]

        );

        if(exists.rows.length){

            await pool.query(

                `
                UPDATE question_logic

                SET next_question_id=$1

                WHERE option_id=$2
                `,

                [

                    next_question_id,
                    option_id

                ]

            );

        }

        else{

            await pool.query(

                `
                INSERT INTO question_logic
                (
                    question_id,
                    option_id,
                    next_question_id
                )
                VALUES
                ($1,$2,$3)
                `,

                [

                    question_id,
                    option_id,
                    next_question_id

                ]

            );

        }

        res.json({

            message:"Saved"

        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            message:"Server error"

        });

    }

};

module.exports={

    getLogic,
    saveLogic

};