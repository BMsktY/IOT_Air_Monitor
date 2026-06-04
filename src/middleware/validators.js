const Joi = require('joi');

const schemas = {
    register: Joi.object({
        Nama: Joi.string().required().messages({
            'string.empty': 'Nama tidak boleh kosong',
            'any.required': 'Nama harus diisi'
        }),
        Email: Joi.string().email().required().messages({
            'string.email': 'Format email tidak valid',
            'string.empty': 'Email tidak boleh kosong',
            'any.required': 'Email harus diisi'
        }),
        Password: Joi.string().min(6).required().messages({
            'string.min': 'Password minimal 6 karakter',
            'string.empty': 'Password tidak boleh kosong',
            'any.required': 'Password harus diisi'
        })
    }),
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Format email tidak valid',
            'string.empty': 'Email tidak boleh kosong',
            'any.required': 'Email harus diisi'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password tidak boleh kosong',
            'any.required': 'Password harus diisi'
        })
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Format email tidak valid',
            'string.empty': 'Email tidak boleh kosong',
            'any.required': 'Email harus diisi'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'Password minimal 6 karakter',
            'string.empty': 'Password tidak boleh kosong',
            'any.required': 'Password harus diisi'
        })
    }),
    adminResetPassword: Joi.object({
        targetEmail: Joi.string().email().required().messages({
            'string.email': 'Format email tidak valid',
            'string.empty': 'Email target tidak boleh kosong',
            'any.required': 'Email target harus diisi'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'Password minimal 6 karakter',
            'string.empty': 'Password tidak boleh kosong',
            'any.required': 'Password harus diisi'
        })
    }),
    sensor: Joi.object({
        Nama_sensor: Joi.string().required().messages({
            'string.empty': 'Nama sensor tidak boleh kosong'
        }),
        Tipe: Joi.string().required().messages({
            'string.empty': 'Tipe sensor tidak boleh kosong'
        }),
        Status: Joi.string().valid('Aktif', 'Nonaktif').optional(),
        Id_lokasi: Joi.number().integer().required().messages({
            'number.base': 'Id_lokasi harus berupa angka'
        })
    }),
    user: Joi.object({
        Nama: Joi.string().required().messages({
            'string.empty': 'Nama tidak boleh kosong'
        }),
        Email: Joi.string().email().required().messages({
            'string.email': 'Format email tidak valid'
        }),
        Role: Joi.string().valid('Admin', 'Analis', 'Publik').required().messages({
            'any.only': 'Role harus Admin, Analis, atau Publik'
        }),
        Password: Joi.string().min(6).optional().messages({
            'string.min': 'Password minimal 6 karakter'
        })
    })
};

module.exports = schemas;
