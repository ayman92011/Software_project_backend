CREATE TABLE PRODUCT (
    PID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    NAME CHAR(64),
    DESCRIPTION VARCHAR(2048),
    RATING DOUBLE(5, 3),
    STOCK INT,
    PICTURE BLOB,
    PRICE FLOAT(20),
    CATEGORY CHAR(32),
    DISCOUNT INT
);