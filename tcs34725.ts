// Samuel Niederer
// TCS34725 extension
//保留
const TCS34725_I2C_ADDRESS = 0x29        //I2C address of the TCS34725 (Page 34)

/* TCS34725 register addresses (Page 20)*/
const TCS34725_REGISTER_ID = 0x12		    // The ID Register provides the value for the part number. The ID register is a read-only register.

const TCS34725_REGISTER_COMMAND = 0x80		// Specifies register address 保留

const TCS34725_REGISTER_CDATAL = 0x14		// Clear data low byte保留
const TCS34725_REGISTER_CDATAH = 0x15		// Clear data high byte

const TCS34725_REGISTER_RDATAL = 0x16		// Red data low byte保留
const TCS34725_REGISTER_RDATAH = 0x17		// Red data high byte

const TCS34725_REGISTER_GDATAL = 0x18		// Green data low byte保留
const TCS34725_REGISTER_GDATAH = 0x19		// Green data high byte

const TCS34725_REGISTER_BDATAL = 0x1A		// Blue data low byte保留
const TCS34725_REGISTER_BDATAH = 0x1B		// Blue data high byte


/* #region Enums for Modes, etc */

// Parameters for setting the internal integration time of the RGBC clear and IR channel.
// 用于设置RGBC清除和IR通道的内部积分时间的参数。 
enum TCS34725_ATIME {
    TIME_2_4_MS = 0xFF,    // 1 2.4 ms 1024
    TIME_24_MS = 0xF6,     // 10 24 ms 10240
    TIME_100_MS = 0xD5,    // 42 101 ms 43008
    TIME_154_MS = 0xC0,    // 64 154 ms 65535
    TIME_700_MS = 0x00     // 256 700 ms 65535
}


// Parameters for...
enum RGB {
    RED,
    GREEN,
    BLUE,
    CLEAR
}



//% weight=100 color=#0fbc11 icon=""
namespace TCS34725 {

    // 保留
    let TCS34725_I2C_ADDR = TCS34725_I2C_ADDRESS;
    export let isConnected = false;
    let atimeIntegrationValue = 0;//保留
    let gainSensorValue = 0

    //保留
    export function initSensor() {
        //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
        //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ID (0x12)
        let device_id = readRegister8(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ID)

        //Check that device Identification has one of 2 i2c addresses         
        if ((device_id != 0x44) && (device_id != 0x10)) {
            isConnected = false;
        }
        else
            isConnected = true;
    }

    /**
     * Read a 8-byte register of the address location
     */
     export function readRegister8(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
    }

    /**
     * Read a (UInt16) 16-byte register of the address location保留
     */
    export function readRegisterUInt16(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.UInt16LE);
    }


    // 保留
    export function pauseSensorForIntegrationTime(atime: TCS34725_ATIME) {
        switch (atime) {
            case TCS34725_ATIME.TIME_2_4_MS: {
                basic.pause(2.4);
                break;
            }
            case TCS34725_ATIME.TIME_24_MS: {
                basic.pause(24);
                break;
            }
            case TCS34725_ATIME.TIME_100_MS: {
                basic.pause(100);
                break;
            }
            case TCS34725_ATIME.TIME_154_MS: {
                basic.pause(154);
                break;
            }
            case TCS34725_ATIME.TIME_700_MS: {
                basic.pause(700);
                break;
            }
        }
    }

    export type RGBC = {
        red: number,
        green: number,
        blue: number,
        clear: number
    };


    //保留
    export function getSensorRGB(): RGBC {
        //Always check that sensor is/was turned on
        while (!isConnected) {
            initSensor();
        }

        //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
        //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_RDATAL (0x16)          
        let redColorValue = readRegisterUInt16(TCS34725_I2C_ADDR, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_RDATAL);

        //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
        //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_GDATAL (0x18)          
        let greenColorValue = readRegisterUInt16(TCS34725_I2C_ADDR, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_GDATAL);

        //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
        //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_BDATAL (0x1A)          
        let blueColorValue = readRegisterUInt16(TCS34725_I2C_ADDR, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_BDATAL);

        //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
        //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_CDATAL (0x14)          
        let clearColorValue = readRegisterUInt16(TCS34725_I2C_ADDR, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_CDATAL);

        pauseSensorForIntegrationTime(atimeIntegrationValue);

        let sum = clearColorValue;
        let r = 0;
        let g = 0;
        let b = 0;

        if (clearColorValue == 0) {
            return {
                red: 0,
                green: 0,
                blue: 0,
                clear: 0
            }
        }
        else {
            r = redColorValue / sum * 255;
            g = greenColorValue / sum * 255;
            b = blueColorValue / sum * 255;

            return {
                red: r,
                green: g,
                blue: b,
                clear: clearColorValue
            }
        }
    }
    //% blockId="getSensorData" block="get color data %colorId"
    export function getSensorData(colorId: RGB): number {
        let data = getSensorRGB();
        let color = 0;

        switch (colorId) {
            case RGB.RED: color = data.red;
                break;
            case RGB.GREEN: color = data.green;
                break;
            case RGB.BLUE: color = data.blue;
                break;
            case RGB.CLEAR: color = data.clear;
                break;
        }

        return color;
    }

}

