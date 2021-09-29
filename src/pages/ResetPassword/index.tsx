import React, { useCallback, useRef } from 'react';
import { FiLock } from 'react-icons/fi';
import { useHistory, useLocation } from 'react-router-dom';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import logo from '../../assets/logo.svg';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import { Container, Content, AnimationContainer, Background } from './styles';

interface ResetPasswordFormData {
    password: string;
    password_confirmation: string;
}

const ResetPassword: React.FC = () => {
    const formRef = useRef<FormHandles>(null);

    const { addToast } = useToast();
    const location = useLocation();
    const history = useHistory();

    const handleSubmit = useCallback(async (data: ResetPasswordFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                password: Yup.string().required('Senha obrigatória'),
                password_confirmation: Yup.string().oneOf(
                    [Yup.ref('password'), null],
                    'Confirmação incorreta',
                ),
            });
            await schema.validate(data, { abortEarly: false });
            const token = location.search.replace('?token=', '');
            console.log(token);

            if (!token) {
                throw new Error();
            }

            await api.post('password/reset', {
                token,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            history.push('/');
        } catch (err) {
            console.log(err);
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);

                return formRef.current?.setErrors(errors);
            }

            addToast({
                type: 'error',
                title: 'Erro ao resetar a senha',
                description: 'Ocorreu um erro ao resetar sua senha',
            });
        }
    }, []);

    return (
        <Container>
            <Content>
                <AnimationContainer>
                    <img src={logo} alt="GoBarber" />

                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Resetar senha</h1>

                        <Input
                            name="password"
                            icon={FiLock}
                            type="password"
                            placeholder="Nova Senha"
                        />

                        <Input
                            name="password_confirmation"
                            icon={FiLock}
                            type="password"
                            placeholder="Confirmação da Senha"
                        />

                        <Button type="submit">Alterar senha</Button>
                    </Form>
                </AnimationContainer>
            </Content>
            <Background />
        </Container>
    );
};

export default ResetPassword;
