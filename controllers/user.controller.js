const Users = require('../models/User.model')
const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require("jsonwebtoken")
 
exports.crearUsuario = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req)
    
    if(!errores.isEmpty()){
        return res.status(400).json(
            {errores: errores.array()}
        ) 
    }

    // EXTRAER EMAIL Y PASSWORD
    const { email, password } = req.body

    try {
        // Revisar que el usuario registrado sea único
        let usuario = await Users.findOne({email})
        

        if(usuario){
            return res.status(400).json({msg: "El usuario ya existe" })
        }

        // guardar el nuevo usuario
        usuario = new Users(req.body)
        console.log("Linea 33:", usuario)

        // Hashear el password
        const salt = await bcryptjs.genSalt(10)
        usuario.password = await bcryptjs.hash(password, salt)
        console.log("Línea 39", usuario)

        // Guardar usuario
        await usuario.save()

        // CREAR JWT
        const payload = {
            usuario: {
                id: usuario.id 
            }
        }

        // FIRMAR EL JWT
        jwt.sign(
            payload, // LOS DATOS QUE SE ENVÍAN AL FRONT (USUARIO.ID)
            process.env.SECRETA, // LA LLAVE O LA FIRMA SECRETA DEL JWT
            {
                expiresIn: 360000 // EXPIRACIÓN - 100 horas
            },
            (error, token) => { // CALLBACK
            
            // SI HAY ERROR, EJECUTA UN ERROR
            if(error) throw error

            // SI TODO MUY BIEN, EJECUTA Mensaje de confirmación
            res.json(
                {
                    token
                }
            ) 
        })

    } catch(error){
        console.log(error)
        res.status(400).send("Hubo un error") 
    }
}

exports.consultarUsuario = async (req,res) => {
    try{
        const id = req.usuario.id
        // console.log(id)

        const infoUsuario = await Users.findById(id)
        res.json({infoUsuario})
        
    } catch(error){
        console.log(error)
        res.status(500).send("Hubo un error intentando consultar la info de este usuario")
    }
}

// editar un usuario dado de alta


exports.editarUsuario = async (req,res)=> {

    try{
        // obtener el elemento
        let id = await Users.findById(req.params.id)

        console.log("el id es",id)
        const {username, email} = req.body
    
        let editarUsuario = await Users.findByIdAndUpdate(id,{username, email},{new:true})
        res.json({editarUsuario})

    }
    catch(error){
        console.log(error)
        res.status(500).send("Hubo un error editando el usuario")
    }
}
