-- Create the USER table
CREATE TABLE USER (
    uid INT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    age INT,
    phone VARCHAR(20),
    mail VARCHAR(255),
    PRIMARY KEY (uid)
);

-- Create the TRAINERS table
CREATE TABLE TRAINERS (
    trainer_id INT,
    uid INT,
    PRIMARY KEY (tr_id),
    FOREIGN KEY (uid) REFERENCES USER (uid)
);

-- Create the TEAM table
CREATE TABLE TEAM (
    team_id INT,
    team_name VARCHAR(255),
    team_desc VARCHAR(255),
    trainer_id INT,
    PRIMARY KEY (tid),
    FOREIGN KEY (tr_id) REFERENCES TRAINERS (tr_id)
);

-- Create the TEAM_INSCRIPTION table
CREATE TABLE TEAM_INSCRIPTION (
    ti_id INT,
    uid INT,
    role INT,
    PRIMARY KEY (ti_id),
    FOREIGN KEY (uid) REFERENCES USER (uid),
    FOREIGN KEY (ti_id) REFERENCES TEAM (tid)
);

-- Create the ACTIVITY table
CREATE TABLE ACTIVITY (
    a_id INT,
    type INT,
    a_description VARCHAR(255),
    a_date DATE,
    a_time TIME,
    a_duration TIME,
    location VARCHAR(255),
    PRIMARY KEY (a_id)
);

-- Create the ACTIVITY_INSCRIPTION table
CREATE TABLE ACTIVITY_INSCRIPTION (
    a_id INT,
    uid INT,
    PRIMARY KEY (a_id, uid),
    FOREIGN KEY (a_id) REFERENCES ACTIVITY (a_id),
    FOREIGN KEY (uid) REFERENCES USER (uid)
);

-- Create the VAA table
CREATE TABLE VAA (
    v_id INT,
    v_name VARCHAR(255),
    v_description VARCHAR(255),
    PRIMARY KEY (v_id)
);

-- Create the PRACTICE_TEAM table
CREATE TABLE PRACTICE_TEAM (
    pt_id INT,
    v1_uid INT,
    v2_uid INT,
    v3_uid INT,
    v4_uid INT,
    v5_uid INT,
    v6_uid INT,
    PRIMARY KEY (pt_id),
    FOREIGN KEY (v1_uid) REFERENCES USER (uid),
    FOREIGN KEY (v2_uid) REFERENCES USER (uid),
    FOREIGN KEY (v3_uid) REFERENCES USER (uid),
    FOREIGN KEY (v4_uid) REFERENCES USER (uid),
    FOREIGN KEY (v5_uid) REFERENCES USER (uid),
    FOREIGN KEY (v6_uid) REFERENCES USER (uid)
);

-- Create the PRACTICE table
CREATE TABLE TRAININGS (
    p_id INT,
    pt_id INT,
    pt_date DATE,
    pt_time TIME,
    pt_duration TIME,
    location VARCHAR(255),
    PRIMARY KEY (p_id),
    FOREIGN KEY (pt_id) REFERENCES PRACTICE_TEAM (pt_id)
);
