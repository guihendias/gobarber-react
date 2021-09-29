import React, { ChangeEvent, useCallback, useRef } from 'react';
import { FiMail, FiLock, FiUser, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import { Container, Content, AvatarInput } from './styles';

interface ProfileFormData {
    name: string;
    email: string;
    old_password: string;
    password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast();
    const history = useHistory();

    const { user, updateUser } = useAuth();

    const handleSubmit = useCallback(async (data: ProfileFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome obrigatório'),
                email: Yup.string()
                    .required('Email obrigatório')
                    .email('Digite um email válido'),
                old_password: Yup.string(),
                password: Yup.string().when('old_password', {
                    is: (val: string) => !!val.length,
                    then: Yup.string().required('Campo obrigatório'),
                    otherwise: Yup.string(),
                }),
                password_confirmation: Yup.string()
                    .when('old_password', {
                        is: (val: string) => !!val.length,
                        then: Yup.string().required('Campo obrigatório'),
                        otherwise: Yup.string(),
                    })
                    .oneOf(
                        [Yup.ref('password'), null],
                        'Confirmação incorreta',
                    ),
            });

            await schema.validate(data, { abortEarly: false });

            const formData = Object.assign(
                {
                    name: data.name,
                    email: data.email,
                },
                data.old_password
                    ? {
                          old_password: data.old_password,
                          password: data.password,
                          password_confirmation: data.password_confirmation,
                      }
                    : {},
            );

            const response = await api.put('/profile', formData);

            updateUser(response.data);

            addToast({
                type: 'success',
                title: 'Perfil realizado!',
                description: 'Suas informações foram atualizadas!',
            });

            history.push('/');
        } catch (err) {
            console.log(err);
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);

                return;
            }

            addToast({
                type: 'error',
                title: 'Erro na atualização',
                description:
                    'Ocorreu um erro ao fazer atualizar suas informações, tente novamente',
            });
        }
    }, []);

    const handleAvatarChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                const data = new FormData();

                data.append('avatar', e.target.files[0]);

                api.patch('/users/avatar', data).then(response => {
                    updateUser(response.data);

                    addToast({
                        type: 'success',
                        title: 'Avatar atualizado com sucesso.',
                    });
                });
            }
        },
        [],
    );

    return (
        <Container>
            <header>
                <div>
                    <Link to="/dashboard">
                        <FiArrowLeft />
                    </Link>
                </div>
            </header>
            <Content>
                <Form
                    ref={formRef}
                    initialData={{
                        name: user.name,
                        email: user.email,
                    }}
                    onSubmit={handleSubmit}
                >
                    <AvatarInput>
                        <img src={user.avatar_url} alt={user.name} />
                        <label htmlFor="avatar">
                            <FiCamera />

                            <input
                                onChange={handleAvatarChange}
                                type="file"
                                id="avatar"
                            />
                        </label>
                    </AvatarInput>

                    <h1>Meu perfil</h1>

                    <Input name="name" icon={FiUser} placeholder="Nome" />

                    <Input
                        name="email"
                        icon={FiMail}
                        type="text"
                        placeholder="E-mail"
                    />

                    <Input
                        containerStyle={{ marginTop: 24 }}
                        name="old_password"
                        icon={FiLock}
                        type="password"
                        placeholder="Senha atual"
                    />

                    <Input
                        name="password"
                        icon={FiLock}
                        type="password"
                        placeholder="Nova senha"
                    />

                    <Input
                        name="password_confirmation"
                        icon={FiLock}
                        type="password"
                        placeholder="Confirmar senha"
                    />

                    <Button type="submit">Confirmar mudanças</Button>
                </Form>
            </Content>
        </Container>
    );
};

export default Profile;
