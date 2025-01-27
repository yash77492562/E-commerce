import crypto from 'crypto';

const key = process.env.ENCRYPTION_KEY;

export const encrypt = (data: string): string => {
    if(key === undefined){
        return 'null'
    }
    const iv = crypto.randomBytes(16);
    const hashedKey = crypto.createHash('sha256').update(key).digest(); 
    const cipher = crypto.createCipheriv('aes-256-cbc', hashedKey, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedData: string): string => {
    if(key === undefined){
        return 'null'
    }
    try {
        const [ivHex, encryptedHex] = encryptedData.split(':');
        if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted data format.');

        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const hashedKey = crypto.createHash('sha256').update(key).digest(); 
        const decipher = crypto.createDecipheriv('aes-256-cbc', hashedKey, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

        return decrypted.toString('utf8');
    } catch (err) {
        console.error('Decryption failed:', err);
        throw new Error('Failed to decrypt the data');
    }
};
