
--
-- PostgreSQL database dump
--

\restrict 7cZsAXNhEVNj09ktb2y0MoD99ZzgJa1iz6IqRmGO7ioTyR1qaSdk7NsGT0UzXK5

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-15 22:25:11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16405)
-- Name: historial_chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_chat (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    emisor character varying(20) NOT NULL,
    mensaje text NOT NULL,
    intento_actual integer,
    fecha_mensaje timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historial_chat OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16404)
-- Name: historial_chat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_chat_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 221
-- Name: historial_chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_chat_id_seq OWNED BY public.historial_chat.id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: tickets_soporte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_soporte (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    identificacion character varying(50) NOT NULL,
    correo_electronico character varying(150),
    telefono character varying(30),
    tipo_dispositivo character varying(100),
    descripcion_problema text NOT NULL,
    estado character varying(30) DEFAULT 'Pendiente'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tickets_soporte OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: tickets_soporte_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_soporte_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_soporte_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 219
-- Name: tickets_soporte_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_soporte_id_seq OWNED BY public.tickets_soporte.id;


--
-- TOC entry 4864 (class 2604 OID 16408)
-- Name: historial_chat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_chat ALTER COLUMN id SET DEFAULT nextval('public.historial_chat_id_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 16393)
-- Name: tickets_soporte id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_soporte ALTER COLUMN id SET DEFAULT nextval('public.tickets_soporte_id_seq'::regclass);


--
-- TOC entry 5021 (class 0 OID 16405)
-- Dependencies: 222
-- Data for Name: historial_chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_chat (id, ticket_id, emisor, mensaje, intento_actual, fecha_mensaje) FROM stdin;
2	3	usuario	El paso anterior no funcionó, dame otra alternativa.	2	2026-10-14 09:13:56.570432
3	3	usuario	El paso anterior no funcionó, dame otra alternativa.	3	2026-10-14 09:14:38.206573
4	6	usuario	El paso anterior no funcionó, dame otra alternativa.	2	2026-10-14 19:37:00.025308
5	6	usuario	El paso anterior no funcionó, dame otra alternativa.	3	2026-10-14 19:37:10.744374
6	7	usuario	El paso anterior no funcionó, dame otra alternativa.	2	2026-10-14 21:23:44.826477
7	7	usuario	El paso anterior no funcionó, dame otra alternativa.	3	2026-10-14 21:23:55.759754
\.


--
-- TOC entry 5019 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: tickets_soporte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_soporte (id, nombre_completo, identificacion, correo_electronico, telefono, tipo_dispositivo, descripcion_problema, estado, fecha_creacion) FROM stdin;
2	Julián	1028782884	julianlondoo14@outlook.com	3208267452	Portatil	no enciende mi portatil	Pendiente	2026-10-14 09:11:26.565882
3	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-14 09:12:53.576537
4	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-14 14:42:42.29977
5	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-14 19:35:39.663425
6	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-14 19:36:42.691837
7	Julian 	1028782884	Julianlondoo14@outlook.com	3208267452	Portatil	El dispositivo, no da video	Pendiente	2026-10-14 21:22:22.878441
8	Felipe	10256465	julianlondoo14@outlook.com	3208267452	Portatil	Mi portatil echa humo	Pendiente	2026-10-15 17:47:38.122924
9	Felipe	10256465	julianlondoo14@outlook.com	3208267452	Portatil	Mi portatil echa humo	Pendiente	2026-10-15 17:48:06.74468
10	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Mi porrrtatil, echa Humo	Pendiente	2026-10-15 17:48:32.213791
11	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Mi portatil, echa humo	Pendiente	2026-10-15 17:49:50.297875
12	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Mi portatil, echa humo	Pendiente	2026-10-15 17:49:58.563908
13	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Mi portatil, echa humo	Pendiente	2026-10-15 17:50:25.356932
14	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Echa humo	Pendiente	2026-10-15 17:54:42.870276
15	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	Echa humo	Pendiente	2026-10-15 17:54:48.119889
16	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-15 17:55:35.520835
17	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-15 17:56:30.686659
18	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No enciende	Pendiente	2026-10-15 17:57:03.928115
19	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 17:58:41.884786
20	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 18:00:17.777791
21	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 18:04:16.854769
22	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 18:05:41.667436
23	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 18:06:09.003572
24	Julián	1028782884	julianlondoo14@gmail.com	3208267452	Portatil	No sive\n	Pendiente	2026-10-15 18:14:01.124072
\.


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 221
-- Name: historial_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_chat_id_seq', 7, true);


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 219
-- Name: tickets_soporte_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_soporte_id_seq', 24, true);


--
-- TOC entry 4869 (class 2606 OID 16417)
-- Name: historial_chat historial_chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_chat
    ADD CONSTRAINT historial_chat_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 16403)
-- Name: tickets_soporte tickets_soporte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_soporte
    ADD CONSTRAINT tickets_soporte_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 16418)
-- Name: historial_chat fk_ticket_historial; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_chat
    ADD CONSTRAINT fk_ticket_historial FOREIGN KEY (ticket_id) REFERENCES public.tickets_soporte(id) ON DELETE CASCADE;


-- Completed on 2026-10-15 22:25:12

--
-- PostgreSQL database dump complete
--

\unrestrict 7cZsAXNhEVNj09ktb2y0MoD99ZzgJa1iz6IqRmGO7ioTyR1qaSdk7NsGT0UzXK5

