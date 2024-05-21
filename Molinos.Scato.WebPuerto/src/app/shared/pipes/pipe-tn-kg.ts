import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pipeTnKg' })
export class PipeTnKg implements PipeTransform {
  transform(value: number, decimals: number = 3): string {
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(decimals);
    return formattedValue.toString();
  }
}