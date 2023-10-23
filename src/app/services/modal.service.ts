import { Injectable } from '@angular/core';
import { ModalComponent } from '../components/modal/modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: ModalComponent[] = [];

    add(modal: ModalComponent) {
        console.log("add")
        // ensure component has a unique id attribute
        if (!modal.id || this.modals.find(x => x.id === modal.id)) {
            throw new Error('modal must have a unique id attribute');
        }

        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(modal: ModalComponent) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x === modal);
    }


    open(id: string) {
        console.log(this.modals)
        // open modal specified by id
        console.log(id)
        const modal = this.modals.find(x => x.id === id);

        console.log(modal)
        if (!modal) {
            throw new Error(`modal '${id}' not found`);
        }

        if(id=="modal-1"){
            if(screen.width<1024){
                modal.open();
            }else{
                console.log("big screen")
                if($("#toc_expanded").css( "display" )=="none"){
                    $("#toc_expanded").css( {"display":"block"} )
                    $("#toc").css( {"background-color":"white"} )
                    
                }else{
                    $("#toc_expanded").css( {"display":"none"} )
                    $("#toc").css( {"background-color":"hsla(0,0%,100%,.4)"} )
                }
            }
        }else{
            modal.open();
        }
        
        




    }

    close() {
        // close the modal that is currently open
        const modal = this.modals.find(x => x.isOpen);
        modal?.close();
    }
}